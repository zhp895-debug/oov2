import { Router } from 'express';
import { prisma, StockTransactionService } from './stockService';

export const kitchenRouter = Router();

// ==========================================
// HELPER FUNCTIONS FOR NUMBER GENERATION
// ==========================================

async function generateRecipeCode(): Promise<string> {
  const count = await prisma.recipe.count();
  const nextNumber = (count + 1).toString().padStart(6, '0');
  return `REC-${nextNumber}`;
}

async function generatePlanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.productionPlan.count();
  const nextNumber = (count + 1).toString().padStart(6, '0');
  return `PLN-${year}-${nextNumber}`;
}

async function generateKitchenRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.kitchenRequest.count();
  const nextNumber = (count + 1).toString().padStart(6, '0');
  return `KR-${year}-${nextNumber}`;
}

async function generateProductionNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.productionRecord.count();
  const nextNumber = (count + 1).toString().padStart(6, '0');
  return `PRD-${year}-${nextNumber}`;
}

/**
 * Calculate dynamic recipe costing using actual inventory average costs
 */
async function computeRecipeCost(recipeId: string, storeId?: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      items: {
        include: { item: true }
      }
    }
  });

  if (!recipe) return { totalCost: 0, costPerUnit: 0, ingredientCosts: [] };

  let totalCost = 0;
  const ingredientCosts = [];

  for (const ri of recipe.items) {
    const item = ri.item;
    // Get average rate or purchase rate
    let unitRate = item.avgRate > 0 ? item.avgRate : item.purchaseRate;

    // If storeId is provided, calculate average rate from store stock valuation
    if (storeId) {
      const valuations = await StockTransactionService.calculateStockValue(item.id, storeId);
      if (valuations.length > 0 && valuations[0].averageRate > 0) {
        unitRate = valuations[0].averageRate;
      }
    }

    const baseQty = ri.quantity;
    const wastageFactor = 1 + (ri.wastagePercentage || 0) / 100;
    const effectiveQty = baseQty * wastageFactor;
    const lineCost = effectiveQty * unitRate;

    totalCost += lineCost;

    ingredientCosts.push({
      recipeItemId: ri.id,
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      baseQuantity: baseQty,
      wastagePercentage: ri.wastagePercentage,
      effectiveQuantity: Math.round(effectiveQty * 1000) / 1000,
      unitId: ri.unitId,
      unitRate: Math.round(unitRate * 100) / 100,
      totalCost: Math.round(lineCost * 100) / 100
    });
  }

  const outputQty = recipe.outputQuantity || 1;
  const costPerUnit = totalCost / outputQty;

  return {
    recipeId: recipe.id,
    recipeCode: recipe.recipeCode,
    recipeName: recipe.name,
    outputQuantity: outputQty,
    outputUnitId: recipe.outputUnitId,
    totalCost: Math.round(totalCost * 100) / 100,
    costPerUnit: Math.round(costPerUnit * 100) / 100,
    ingredientCosts
  };
}

// ==========================================
// 1. RECIPE MASTER ENDPOINTS
// ==========================================

/**
 * GET /api/recipes - List recipes with optional search/status filter
 */
kitchenRouter.get('/recipes', async (req, res) => {
  try {
    const { search, status } = req.query as any;

    const recipes = await prisma.recipe.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { recipeCode: { contains: search } },
            { description: { contains: search } }
          ]
        } : {})
      },
      include: {
        outputItem: true,
        items: {
          include: { item: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Attach estimated costs
    const enriched = await Promise.all(
      recipes.map(async (r) => {
        const costing = await computeRecipeCost(r.id);
        return {
          ...r,
          totalEstimatedCost: costing.totalCost,
          costPerUnit: costing.costPerUnit
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recipes/:id - Detailed Recipe with Costing
 */
kitchenRouter.get('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        outputItem: true,
        items: {
          include: { item: true },
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const costing = await computeRecipeCost(recipe.id);

    res.json({
      ...recipe,
      costing
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recipes - Create New Recipe
 */
kitchenRouter.post('/recipes', async (req, res) => {
  try {
    const {
      name,
      description,
      outputItemId,
      outputQuantity,
      outputUnitId,
      yieldQuantity,
      wastagePercentage,
      status,
      createdBy,
      items
    } = req.body;

    if (!name || !outputQuantity || !outputUnitId) {
      return res.status(400).json({ error: 'name, outputQuantity, and outputUnitId are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Recipe must contain at least one ingredient.' });
    }

    const recipeCode = req.body.recipeCode || (await generateRecipeCode());

    const recipe = await prisma.recipe.create({
      data: {
        recipeCode,
        name,
        description,
        outputItemId: outputItemId || null,
        outputQuantity: parseFloat(outputQuantity),
        outputUnitId,
        yieldQuantity: yieldQuantity ? parseFloat(yieldQuantity) : parseFloat(outputQuantity),
        wastagePercentage: wastagePercentage ? parseFloat(wastagePercentage) : 0,
        version: 1,
        status: status || 'ACTIVE',
        createdBy: createdBy || 'Head Chef',
        items: {
          create: items.map((ri: any, idx: number) => ({
            itemId: ri.itemId,
            quantity: parseFloat(ri.quantity),
            unitId: ri.unitId,
            wastagePercentage: ri.wastagePercentage ? parseFloat(ri.wastagePercentage) : 0,
            isOptional: !!ri.isOptional,
            sequenceNumber: ri.sequenceNumber || idx + 1,
            remarks: ri.remarks || null
          }))
        }
      },
      include: {
        outputItem: true,
        items: {
          include: { item: true }
        }
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        user: createdBy || 'Head Chef',
        role: 'KITCHEN_MANAGER',
        action: 'RECIPE_CREATED',
        module: 'KITCHEN',
        description: `Created new recipe '${recipe.name}' (${recipe.recipeCode}) version 1`,
        reference: recipe.id
      }
    });

    res.status(201).json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/recipes/:id - Update Recipe (Supports Versioning)
 */
kitchenRouter.put('/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      outputItemId,
      outputQuantity,
      outputUnitId,
      yieldQuantity,
      wastagePercentage,
      status,
      user,
      createNewVersion,
      items
    } = req.body;

    const existing = await prisma.recipe.findUnique({
      where: { id },
      include: { productionRecords: true }
    });

    if (!existing) return res.status(404).json({ error: 'Recipe not found' });

    // Check if recipe has historical production records
    const hasHistory = existing.productionRecords.length > 0;
    const shouldIncrementVersion = createNewVersion || hasHistory;
    const newVersion = shouldIncrementVersion ? existing.version + 1 : existing.version;

    // Delete existing recipe items and update recipe
    const updatedRecipe = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        await tx.recipeItem.deleteMany({ where: { recipeId: id } });
      }

      return await tx.recipe.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          description,
          outputItemId: outputItemId || null,
          ...(outputQuantity ? { outputQuantity: parseFloat(outputQuantity) } : {}),
          ...(outputUnitId ? { outputUnitId } : {}),
          yieldQuantity: yieldQuantity ? parseFloat(yieldQuantity) : (outputQuantity ? parseFloat(outputQuantity) : existing.yieldQuantity),
          wastagePercentage: wastagePercentage !== undefined ? parseFloat(wastagePercentage) : existing.wastagePercentage,
          version: newVersion,
          ...(status ? { status } : {}),
          ...(items && Array.isArray(items) ? {
            items: {
              create: items.map((ri: any, idx: number) => ({
                itemId: ri.itemId,
                quantity: parseFloat(ri.quantity),
                unitId: ri.unitId,
                wastagePercentage: ri.wastagePercentage ? parseFloat(ri.wastagePercentage) : 0,
                isOptional: !!ri.isOptional,
                sequenceNumber: ri.sequenceNumber || idx + 1,
                remarks: ri.remarks || null
              }))
            }
          } : {})
        },
        include: {
          outputItem: true,
          items: { include: { item: true } }
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Head Chef',
        role: 'KITCHEN_MANAGER',
        action: 'RECIPE_UPDATED',
        module: 'KITCHEN',
        description: `Updated recipe '${updatedRecipe.name}' (${updatedRecipe.recipeCode}) to version ${updatedRecipe.version}`,
        reference: updatedRecipe.id
      }
    });

    res.json(updatedRecipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recipes/:id/activate - Activate Recipe
 */
kitchenRouter.post('/recipes/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const recipe = await prisma.recipe.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Head Chef',
        role: 'KITCHEN_MANAGER',
        action: 'RECIPE_ACTIVATED',
        module: 'KITCHEN',
        description: `Activated recipe '${recipe.name}' (${recipe.recipeCode})`,
        reference: recipe.id
      }
    });

    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recipes/:id/archive - Archive Recipe
 */
kitchenRouter.post('/recipes/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    const recipe = await prisma.recipe.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Head Chef',
        role: 'KITCHEN_MANAGER',
        action: 'RECIPE_ARCHIVED',
        module: 'KITCHEN',
        description: `Archived recipe '${recipe.name}' (${recipe.recipeCode})`,
        reference: recipe.id
      }
    });

    res.json(recipe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recipes/:id/calculate - Dynamic Ingredient Calculation
 */
kitchenRouter.post('/recipes/:id/calculate', async (req, res) => {
  try {
    const { id } = req.params;
    const { productionQuantity, storeId } = req.body;

    if (!productionQuantity || parseFloat(productionQuantity) <= 0) {
      return res.status(400).json({ error: 'Valid productionQuantity is required.' });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        items: {
          include: { item: true }
        }
      }
    });

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const prodQty = parseFloat(productionQuantity);
    const outputQty = recipe.outputQuantity || 1;
    const multiplier = prodQty / outputQty;

    const ingredients = [];
    let totalEstimatedCost = 0;

    for (const ri of recipe.items) {
      const item = ri.item;
      let unitRate = item.avgRate > 0 ? item.avgRate : item.purchaseRate;

      if (storeId) {
        const valuations = await StockTransactionService.calculateStockValue(item.id, storeId);
        if (valuations.length > 0 && valuations[0].averageRate > 0) {
          unitRate = valuations[0].averageRate;
        }
      }

      const baseQty = ri.quantity * multiplier;
      const wastagePct = ri.wastagePercentage || 0;
      const expectedWastage = baseQty * (wastagePct / 100);
      const totalRequiredQuantity = baseQty + expectedWastage;
      const lineCost = totalRequiredQuantity * unitRate;

      totalEstimatedCost += lineCost;

      // Check available stock in store if storeId provided
      let availableQuantity = 0;
      let shortageQuantity = 0;
      if (storeId) {
        availableQuantity = await StockTransactionService.getCurrentStock(item.id, storeId);
        shortageQuantity = Math.max(0, totalRequiredQuantity - availableQuantity);
      }

      ingredients.push({
        itemId: item.id,
        itemCode: item.code,
        itemName: item.name,
        category: item.category,
        baseQuantity: Math.round(baseQty * 1000) / 1000,
        wastagePercentage: wastagePct,
        expectedWastage: Math.round(expectedWastage * 1000) / 1000,
        requiredQuantity: Math.round(totalRequiredQuantity * 1000) / 1000,
        unitId: ri.unitId,
        availableQuantity: Math.round(availableQuantity * 1000) / 1000,
        shortageQuantity: Math.round(shortageQuantity * 1000) / 1000,
        unitRate: Math.round(unitRate * 100) / 100,
        estimatedCost: Math.round(lineCost * 100) / 100
      });
    }

    res.json({
      recipeId: recipe.id,
      recipeCode: recipe.recipeCode,
      recipeName: recipe.name,
      recipeVersion: recipe.version,
      productionQuantity: prodQty,
      outputUnitId: recipe.outputUnitId,
      multiplier: Math.round(multiplier * 1000) / 1000,
      totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
      costPerUnit: Math.round((totalEstimatedCost / prodQty) * 100) / 100,
      ingredients
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PRODUCTION PLANNING ENDPOINTS
// ==========================================

/**
 * GET /api/production/plans - List Production Plans
 */
kitchenRouter.get('/production/plans', async (req, res) => {
  try {
    const { status, storeId } = req.query as any;

    const plans = await prisma.productionPlan.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(storeId && storeId !== 'ALL' ? { storeId } : {})
      },
      include: {
        store: true,
        recipe: { include: { outputItem: true } },
        items: { include: { item: true } },
        kitchenRequests: true,
        productionRecords: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/plans - Create Production Plan
 */
kitchenRouter.post('/production/plans', async (req, res) => {
  try {
    const {
      productionDate,
      storeId,
      recipeId,
      plannedQuantity,
      unitId,
      remarks,
      createdBy
    } = req.body;

    if (!storeId || !recipeId || !plannedQuantity) {
      return res.status(400).json({ error: 'storeId, recipeId, and plannedQuantity are required.' });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { items: { include: { item: true } } }
    });

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const planNumber = await generatePlanNumber();
    const prodQty = parseFloat(plannedQuantity);
    const multiplier = prodQty / (recipe.outputQuantity || 1);

    // Calculate requirements & check available stock
    const planItemsData = [];
    for (const ri of recipe.items) {
      const baseQty = ri.quantity * multiplier;
      const reqQty = baseQty * (1 + (ri.wastagePercentage || 0) / 100);
      const availQty = await StockTransactionService.getCurrentStock(ri.itemId, storeId);
      const shortageQty = Math.max(0, reqQty - availQty);

      planItemsData.push({
        itemId: ri.itemId,
        requiredQuantity: reqQty,
        unitId: ri.unitId,
        availableQuantity: availQty,
        shortageQuantity: shortageQty,
        remarks: ri.remarks || null
      });
    }

    const plan = await prisma.productionPlan.create({
      data: {
        planNumber,
        productionDate: productionDate ? new Date(productionDate) : new Date(),
        storeId,
        recipeId,
        recipeVersion: recipe.version,
        plannedQuantity: prodQty,
        unitId: unitId || recipe.outputUnitId,
        status: 'DRAFT',
        createdBy: createdBy || 'Kitchen Manager',
        remarks: remarks || null,
        items: {
          create: planItemsData
        }
      },
      include: {
        store: true,
        recipe: true,
        items: { include: { item: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: createdBy || 'Kitchen Manager',
        role: 'KITCHEN_MANAGER',
        action: 'PRODUCTION_PLAN_CREATED',
        module: 'PRODUCTION',
        description: `Created Production Plan ${plan.planNumber} for ${plan.plannedQuantity} ${plan.unitId} ${recipe.name}`,
        reference: plan.id
      }
    });

    res.status(201).json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/production/plans/:id
 */
kitchenRouter.get('/production/plans/:id', async (req, res) => {
  try {
    const plan = await prisma.productionPlan.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        recipe: { include: { items: { include: { item: true } } } },
        items: { include: { item: true } },
        kitchenRequests: { include: { items: { include: { item: true } } } },
        productionRecords: true
      }
    });

    if (!plan) return res.status(404).json({ error: 'Production Plan not found' });
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/plans/:id/submit
 */
kitchenRouter.post('/production/plans/:id/submit', async (req, res) => {
  try {
    const { user } = req.body;
    const plan = await prisma.productionPlan.update({
      where: { id: req.params.id },
      data: { status: 'SUBMITTED' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Kitchen Staff',
        role: 'KITCHEN_STAFF',
        action: 'PRODUCTION_PLAN_SUBMITTED',
        module: 'PRODUCTION',
        description: `Submitted Production Plan ${plan.planNumber} for approval`,
        reference: plan.id
      }
    });

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/plans/:id/approve
 */
kitchenRouter.post('/production/plans/:id/approve', async (req, res) => {
  try {
    const { user } = req.body;
    const plan = await prisma.productionPlan.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: user || 'Head Chef',
        approvedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Head Chef',
        role: 'KITCHEN_MANAGER',
        action: 'PRODUCTION_PLAN_APPROVED',
        module: 'PRODUCTION',
        description: `Approved Production Plan ${plan.planNumber}`,
        reference: plan.id
      }
    });

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/plans/:id/cancel
 */
kitchenRouter.post('/production/plans/:id/cancel', async (req, res) => {
  try {
    const { user } = req.body;
    const plan = await prisma.productionPlan.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Kitchen Manager',
        role: 'KITCHEN_MANAGER',
        action: 'PRODUCTION_PLAN_CANCELLED',
        module: 'PRODUCTION',
        description: `Cancelled Production Plan ${plan.planNumber}`,
        reference: plan.id
      }
    });

    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. KITCHEN REQUEST & ISSUE ENDPOINTS
// ==========================================

/**
 * GET /api/kitchen/requests
 */
kitchenRouter.get('/kitchen/requests', async (req, res) => {
  try {
    const { status, storeId } = req.query as any;

    const requests = await prisma.kitchenRequest.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(storeId && storeId !== 'ALL' ? { storeId } : {})
      },
      include: {
        store: true,
        productionPlan: { include: { recipe: true } },
        items: { include: { item: true } },
        productionRecords: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/kitchen/requests - Create Kitchen Request
 */
kitchenRouter.post('/kitchen/requests', async (req, res) => {
  try {
    const {
      productionPlanId,
      storeId,
      requestedBy,
      remarks,
      items
    } = req.body;

    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'storeId and at least one item are required.' });
    }

    const requestNumber = await generateKitchenRequestNumber();

    const request = await prisma.kitchenRequest.create({
      data: {
        requestNumber,
        productionPlanId: productionPlanId || null,
        storeId,
        requestedBy: requestedBy || 'Kitchen Chef',
        status: 'SUBMITTED',
        remarks: remarks || null,
        items: {
          create: items.map((i: any) => ({
            itemId: i.itemId,
            requestedQuantity: parseFloat(i.requestedQuantity),
            approvedQuantity: i.approvedQuantity ? parseFloat(i.approvedQuantity) : parseFloat(i.requestedQuantity),
            issuedQuantity: 0,
            unitId: i.unitId,
            remarks: i.remarks || null
          }))
        }
      },
      include: {
        store: true,
        productionPlan: true,
        items: { include: { item: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        user: requestedBy || 'Kitchen Chef',
        role: 'KITCHEN_STAFF',
        action: 'KITCHEN_REQUEST_CREATED',
        module: 'KITCHEN',
        description: `Created Kitchen Request ${request.requestNumber}`,
        reference: request.id
      }
    });

    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/kitchen/requests/:id
 */
kitchenRouter.get('/kitchen/requests/:id', async (req, res) => {
  try {
    const request = await prisma.kitchenRequest.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        productionPlan: { include: { recipe: true } },
        items: { include: { item: true } },
        productionRecords: true
      }
    });

    if (!request) return res.status(404).json({ error: 'Kitchen Request not found' });
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/kitchen/requests/:id/approve
 */
kitchenRouter.post('/kitchen/requests/:id/approve', async (req, res) => {
  try {
    const { approvedBy, approvedItems } = req.body;
    const { id } = req.params;

    const request = await prisma.kitchenRequest.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Update approved quantities if supplied
    if (approvedItems && Array.isArray(approvedItems)) {
      for (const item of approvedItems) {
        await prisma.kitchenRequestItem.update({
          where: { id: item.id },
          data: { approvedQuantity: parseFloat(item.approvedQuantity) }
        });
      }
    }

    const updated = await prisma.kitchenRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approvedBy || 'Store Manager',
        approvedAt: new Date()
      },
      include: { items: { include: { item: true } } }
    });

    await prisma.auditLog.create({
      data: {
        user: approvedBy || 'Store Manager',
        role: 'STORE_MANAGER',
        action: 'KITCHEN_REQUEST_APPROVED',
        module: 'KITCHEN',
        description: `Approved Kitchen Request ${updated.requestNumber}`,
        reference: updated.id
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/kitchen/requests/:id/issue - Execute Kitchen Stock Issue
 * CRITICAL RULE: Deducts stock using CONSUMPTION_OUT via StockTransactionService
 */
kitchenRouter.post('/kitchen/requests/:id/issue', async (req, res) => {
  try {
    const { id } = req.params;
    const { issuedBy, itemIssues } = req.body;

    const request = await prisma.kitchenRequest.findUnique({
      where: { id },
      include: {
        items: { include: { item: true } },
        store: true
      }
    });

    if (!request) return res.status(404).json({ error: 'Kitchen Request not found' });

    const settings = await StockTransactionService.getSettings();
    const storeId = request.storeId;

    // Validate availability before issuing
    const issueMap = new Map<string, { qtyToIssue: number; batchNumber?: string }>();
    if (itemIssues && Array.isArray(itemIssues)) {
      itemIssues.forEach((ii: any) => {
        issueMap.set(ii.requestItemId, {
          qtyToIssue: parseFloat(ii.issuedQuantity),
          batchNumber: ii.batchNumber
        });
      });
    }

    // Process issue inside transaction
    const result = await prisma.$transaction(async (tx) => {
      let isFullyIssued = true;
      let anyIssued = false;

      for (const reqItem of request.items) {
        const issueInfo = issueMap.get(reqItem.id);
        const qtyToIssue = issueInfo
          ? issueInfo.qtyToIssue
          : reqItem.approvedQuantity - reqItem.issuedQuantity;

        if (qtyToIssue <= 0) continue;

        const currentStock = await StockTransactionService.getCurrentStock(
          reqItem.itemId,
          storeId,
          undefined,
          issueInfo?.batchNumber
        );

        if (qtyToIssue > currentStock) {
          if (!settings.allowPartialKitchenIssue) {
            throw new Error(
              `Insufficient stock for '${reqItem.item.name}'. Required: ${qtyToIssue} ${reqItem.unitId}, Available: ${currentStock} ${reqItem.unitId}. Partial issues disabled.`
            );
          }
        }

        const actualIssueQty = Math.min(qtyToIssue, currentStock > 0 ? currentStock : (settings.allowNegativeStock ? qtyToIssue : 0));

        if (actualIssueQty > 0) {
          anyIssued = true;

          // Issue stock via StockTransactionService (CONSUMPTION_OUT)
          await StockTransactionService.createOutTransaction(
            {
              itemId: reqItem.itemId,
              storeId,
              transactionType: 'CONSUMPTION_OUT',
              quantity: actualIssueQty,
              unitId: reqItem.unitId,
              rate: reqItem.item.avgRate > 0 ? reqItem.item.avgRate : reqItem.item.purchaseRate,
              batchNumber: issueInfo?.batchNumber,
              referenceType: 'KITCHEN_REQUEST',
              referenceId: request.requestNumber,
              remarks: `Kitchen Issue against Request ${request.requestNumber}`,
              createdBy: issuedBy || 'Store Issuer'
            },
            tx
          );

          // Update issued quantity on request item
          const newIssuedQty = reqItem.issuedQuantity + actualIssueQty;
          await tx.kitchenRequestItem.update({
            where: { id: reqItem.id },
            data: { issuedQuantity: newIssuedQty }
          });

          if (newIssuedQty < reqItem.requestedQuantity) {
            isFullyIssued = false;
          }
        } else {
          isFullyIssued = false;
        }
      }

      const finalStatus = isFullyIssued ? 'ISSUED' : (anyIssued ? 'PARTIALLY_ISSUED' : request.status);

      const updatedRequest = await tx.kitchenRequest.update({
        where: { id },
        data: { status: finalStatus },
        include: { items: { include: { item: true } } }
      });

      await tx.auditLog.create({
        data: {
          user: issuedBy || 'Store Issuer',
          role: 'STORE_MANAGER',
          action: 'KITCHEN_STOCK_ISSUED',
          module: 'KITCHEN',
          description: `Issued stock for Kitchen Request ${request.requestNumber} (Status: ${finalStatus})`,
          reference: request.id
        }
      });

      return updatedRequest;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 4. PRODUCTION RECORD & CONSUMPTION ENDPOINTS
// ==========================================

/**
 * GET /api/production/records
 */
kitchenRouter.get('/production/records', async (req, res) => {
  try {
    const { status, storeId } = req.query as any;

    const records = await prisma.productionRecord.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(storeId && storeId !== 'ALL' ? { storeId } : {})
      },
      include: {
        store: true,
        recipe: { include: { outputItem: true } },
        productionPlan: true,
        kitchenRequest: true,
        ingredients: { include: { item: true } },
        wastages: { include: { item: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/production/records/:id
 */
kitchenRouter.get('/production/records/:id', async (req, res) => {
  try {
    const record = await prisma.productionRecord.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        recipe: { include: { outputItem: true, items: { include: { item: true } } } },
        productionPlan: true,
        kitchenRequest: { include: { items: { include: { item: true } } } },
        ingredients: { include: { item: true } },
        wastages: { include: { item: true } }
      }
    });

    if (!record) return res.status(404).json({ error: 'Production Record not found' });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/records - Start Production Record
 */
kitchenRouter.post('/production/records', async (req, res) => {
  try {
    const {
      productionPlanId,
      kitchenRequestId,
      recipeId,
      storeId,
      plannedQuantity,
      unitId,
      createdBy
    } = req.body;

    if (!recipeId || !storeId || !plannedQuantity) {
      return res.status(400).json({ error: 'recipeId, storeId, and plannedQuantity are required.' });
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const productionNumber = await generateProductionNumber();

    const record = await prisma.productionRecord.create({
      data: {
        productionNumber,
        productionPlanId: productionPlanId || null,
        kitchenRequestId: kitchenRequestId || null,
        recipeId,
        recipeVersion: recipe.version,
        storeId,
        plannedQuantity: parseFloat(plannedQuantity),
        actualQuantity: parseFloat(plannedQuantity),
        unitId: unitId || recipe.outputUnitId,
        status: 'STARTED',
        startedAt: new Date(),
        createdBy: createdBy || 'Kitchen Chef'
      },
      include: {
        recipe: true,
        store: true
      }
    });

    await prisma.auditLog.create({
      data: {
        user: createdBy || 'Kitchen Chef',
        role: 'KITCHEN_MANAGER',
        action: 'PRODUCTION_STARTED',
        module: 'PRODUCTION',
        description: `Started Production ${record.productionNumber} for ${record.plannedQuantity} ${record.unitId} ${recipe.name}`,
        reference: record.id
      }
    });

    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/records/:id/complete
 * CRITICAL DOUBLE-DEDUCTION PROTECTION LOGIC IMPLEMENTED HERE
 */
kitchenRouter.post('/production/records/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      actualQuantity,
      ingredients, // [{ itemId, actualQuantity, unitId, remarks }]
      wastages,    // [{ itemId, quantity, unitId, reason }]
      completedBy
    } = req.body;

    const record = await prisma.productionRecord.findUnique({
      where: { id },
      include: {
        recipe: { include: { items: { include: { item: true } } } },
        kitchenRequest: { include: { items: true } },
        productionPlan: { include: { kitchenRequests: { include: { items: true } } } }
      }
    });

    if (!record) return res.status(404).json({ error: 'Production Record not found' });
    if (record.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Production record has already been completed.' });
    }

    const settings = await StockTransactionService.getSettings();
    const finalActualQuantity = actualQuantity ? parseFloat(actualQuantity) : record.plannedQuantity;
    const multiplier = finalActualQuantity / (record.recipe.outputQuantity || 1);

    // Collect pre-issued quantities from associated Kitchen Requests to prevent DOUBLE DEDUCTION
    const preIssuedMap = new Map<string, number>();

    if (record.kitchenRequest) {
      record.kitchenRequest.items.forEach(kri => {
        const curr = preIssuedMap.get(kri.itemId) || 0;
        preIssuedMap.set(kri.itemId, curr + kri.issuedQuantity);
      });
    } else if (record.productionPlan && record.productionPlan.kitchenRequests) {
      record.productionPlan.kitchenRequests.forEach(kr => {
        kr.items.forEach(kri => {
          const curr = preIssuedMap.get(kri.itemId) || 0;
          preIssuedMap.set(kri.itemId, curr + kri.issuedQuantity);
        });
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const ingredientRecordsData = [];

      for (const recipeItem of record.recipe.items) {
        const item = recipeItem.item;
        const expectedQty = recipeItem.quantity * multiplier * (1 + (recipeItem.wastagePercentage || 0) / 100);

        // Find actual consumed quantity provided by user, or default to expected
        const userIng = ingredients?.find((i: any) => i.itemId === item.id);
        const actualConsumedQty = userIng ? parseFloat(userIng.actualQuantity) : expectedQty;

        const preIssuedQty = preIssuedMap.get(item.id) || 0;

        // DOUBLE-DEDUCTION PROTECTION:
        // Only deduct if actual consumed quantity exceeds pre-issued stock!
        const netStockToDeduct = Math.max(0, actualConsumedQty - preIssuedQty);

        if (netStockToDeduct > 0) {
          // Deduct remaining un-issued quantity from inventory
          await StockTransactionService.createOutTransaction(
            {
              itemId: item.id,
              storeId: record.storeId,
              transactionType: 'CONSUMPTION_OUT',
              quantity: netStockToDeduct,
              unitId: recipeItem.unitId,
              rate: item.avgRate > 0 ? item.avgRate : item.purchaseRate,
              referenceType: 'PRODUCTION_RECORD',
              referenceId: record.productionNumber,
              remarks: `Actual Consumption for ${record.productionNumber} (Pre-issued: ${preIssuedQty}, Net Deducted: ${netStockToDeduct})`,
              createdBy: completedBy || 'Kitchen Chef'
            },
            tx
          );
        }

        const varianceQty = actualConsumedQty - expectedQty;
        const variancePct = expectedQty > 0 ? (varianceQty / expectedQty) * 100 : 0;

        ingredientRecordsData.push({
          itemId: item.id,
          expectedQuantity: expectedQty,
          actualQuantity: actualConsumedQty,
          unitId: recipeItem.unitId,
          varianceQuantity: varianceQty,
          variancePercentage: variancePct,
          remarks: userIng?.remarks || (variancePct > (settings.productionVarianceThreshold || 5) ? `Variance exceeding threshold (${variancePct.toFixed(1)}%)` : null)
        });
      }

      // Handle Production Wastage
      const wastageRecordsData = [];
      if (wastages && Array.isArray(wastages)) {
        for (const w of wastages) {
          const wQty = parseFloat(w.quantity);
          if (wQty > 0) {
            const item = await tx.item.findUnique({ where: { id: w.itemId } });
            const itemRate = item?.avgRate || item?.purchaseRate || 0;
            const estimatedVal = wQty * itemRate;

            // Record wastage transaction WASTAGE_OUT
            await StockTransactionService.createOutTransaction(
              {
                itemId: w.itemId,
                storeId: record.storeId,
                transactionType: 'WASTAGE_OUT',
                quantity: wQty,
                unitId: w.unitId,
                rate: itemRate,
                referenceType: 'PRODUCTION_RECORD',
                referenceId: record.productionNumber,
                remarks: `Production Wastage [${w.reason}]: ${record.productionNumber}`,
                createdBy: completedBy || 'Kitchen Chef'
              },
              tx
            );

            wastageRecordsData.push({
              itemId: w.itemId,
              quantity: wQty,
              unitId: w.unitId,
              reason: w.reason || 'Preparation Waste',
              estimatedValue: estimatedVal,
              createdBy: completedBy || 'Kitchen Chef'
            });
          }
        }
      }

      // Handle Finished Goods Tracking (PRODUCTION_IN)
      if (settings.trackFinishedGoods && record.recipe.outputItemId) {
        // Calculate total batch cost for finished good
        let totalIngCost = 0;
        ingredientRecordsData.forEach(ing => {
          const rItem = record.recipe.items.find(ri => ri.itemId === ing.itemId);
          const rate = rItem?.item.avgRate || rItem?.item.purchaseRate || 0;
          totalIngCost += ing.actualQuantity * rate;
        });

        const finishedUnitCost = finalActualQuantity > 0 ? totalIngCost / finalActualQuantity : 0;

        await StockTransactionService.createInTransaction(
          {
            itemId: record.recipe.outputItemId,
            storeId: record.storeId,
            transactionType: 'PRODUCTION_IN',
            quantity: finalActualQuantity,
            unitId: record.unitId,
            rate: finishedUnitCost,
            referenceType: 'PRODUCTION_RECORD',
            referenceId: record.productionNumber,
            remarks: `Finished Production Output for ${record.productionNumber}`,
            createdBy: completedBy || 'Kitchen Chef'
          },
          tx
        );
      }

      // Update Production Record status to COMPLETED
      const updatedRecord = await tx.productionRecord.update({
        where: { id },
        data: {
          actualQuantity: finalActualQuantity,
          status: 'COMPLETED',
          completedAt: new Date(),
          ingredients: {
            create: ingredientRecordsData
          },
          ...(wastageRecordsData.length > 0 ? {
            wastages: { create: wastageRecordsData }
          } : {})
        },
        include: {
          recipe: true,
          store: true,
          ingredients: { include: { item: true } },
          wastages: { include: { item: true } }
        }
      });

      // Update Production Plan status to COMPLETED if linked
      if (record.productionPlanId) {
        await tx.productionPlan.update({
          where: { id: record.productionPlanId },
          data: { status: 'COMPLETED' }
        });
      }

      await tx.auditLog.create({
        data: {
          user: completedBy || 'Kitchen Chef',
          role: 'KITCHEN_MANAGER',
          action: 'PRODUCTION_COMPLETED',
          module: 'PRODUCTION',
          description: `Completed Production ${record.productionNumber} for ${finalActualQuantity} ${record.unitId} ${record.recipe.name}`,
          reference: record.id
        }
      });

      return updatedRecord;
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/production/records/:id/cancel
 */
kitchenRouter.post('/production/records/:id/cancel', async (req, res) => {
  try {
    const { user } = req.body;
    const record = await prisma.productionRecord.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        user: user || 'Kitchen Manager',
        role: 'KITCHEN_MANAGER',
        action: 'PRODUCTION_CANCELLED',
        module: 'PRODUCTION',
        description: `Cancelled Production Record ${record.productionNumber}`,
        reference: record.id
      }
    });

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/production/wastage - Standalone Production Wastage Entry
 */
kitchenRouter.post('/production/wastage', async (req, res) => {
  try {
    const {
      productionRecordId,
      itemId,
      quantity,
      unitId,
      reason,
      createdBy,
      storeId
    } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({ error: 'itemId and quantity are required.' });
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const qty = parseFloat(quantity);
    const rate = item.avgRate > 0 ? item.avgRate : item.purchaseRate;
    const estVal = qty * rate;

    // Deduct wastage from stock
    const targetStoreId = storeId || (productionRecordId ? (await prisma.productionRecord.findUnique({ where: { id: productionRecordId } }))?.storeId : undefined);
    const stores = await prisma.store.findMany({ where: { status: 'active' } });
    const finalStoreId = targetStoreId || stores[0]?.id;

    const tx = await StockTransactionService.createOutTransaction({
      itemId,
      storeId: finalStoreId,
      transactionType: 'WASTAGE_OUT',
      quantity: qty,
      unitId: unitId || item.unit,
      rate,
      remarks: `Kitchen Production Wastage (${reason || 'Spillage'})`,
      createdBy: createdBy || 'Kitchen Staff'
    });

    let wastageRecord = null;
    if (productionRecordId) {
      wastageRecord = await prisma.productionWastage.create({
        data: {
          productionRecordId,
          itemId,
          quantity: qty,
          unitId: unitId || item.unit,
          reason: reason || 'Preparation Waste',
          estimatedValue: estVal,
          createdBy: createdBy || 'Kitchen Staff'
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        user: createdBy || 'Kitchen Staff',
        role: 'KITCHEN_STAFF',
        action: 'PRODUCTION_WASTAGE_CREATED',
        module: 'KITCHEN',
        description: `Recorded production wastage: ${qty} ${unitId || item.unit} ${item.name} (Value: ₹${estVal})`,
        itemId,
        quantity: qty,
        storeId: finalStoreId,
        reference: tx.id
      }
    });

    res.status(201).json({
      transaction: tx,
      wastageRecord
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 5. KITCHEN DASHBOARD METRICS API
// ==========================================

kitchenRouter.get('/kitchen/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Production Records
    const todayProduction = await prisma.productionRecord.findMany({
      where: {
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      include: {
        recipe: true,
        ingredients: { include: { item: true } }
      }
    });

    let todayProductionCount = todayProduction.length;
    let todayProductionCost = 0;
    let totalVariancePctSum = 0;

    todayProduction.forEach(p => {
      p.ingredients.forEach(i => {
        const rate = i.item.avgRate > 0 ? i.item.avgRate : i.item.purchaseRate;
        todayProductionCost += i.actualQuantity * rate;
        totalVariancePctSum += Math.abs(i.variancePercentage);
      });
    });

    const avgProductionVariance = todayProduction.length > 0
      ? totalVariancePctSum / (todayProduction.reduce((acc, p) => acc + p.ingredients.length, 0) || 1)
      : 0;

    // Today's Kitchen Requests
    const todayRequests = await prisma.kitchenRequest.findMany({
      where: { createdAt: { gte: today } }
    });

    const pendingRequests = await prisma.kitchenRequest.count({
      where: { status: { in: ['SUBMITTED', 'APPROVED', 'DRAFT'] } }
    });

    // Issued Items Today
    const todayIssues = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: today },
        transactionType: 'CONSUMPTION_OUT',
        status: 'POSTED'
      }
    });

    let itemsIssuedTodayQty = 0;
    let itemsIssuedTodayValue = 0;

    todayIssues.forEach(t => {
      itemsIssuedTodayQty += t.quantity;
      itemsIssuedTodayValue += (t.totalValue || t.quantity * t.rate!);
    });

    // Today's Production Wastage
    const todayWastageTxs = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: today },
        transactionType: 'WASTAGE_OUT',
        status: 'POSTED'
      }
    });

    let wastageTodayValue = 0;
    let wastageTodayQty = 0;

    todayWastageTxs.forEach(t => {
      wastageTodayQty += t.quantity;
      wastageTodayValue += (t.totalValue || t.quantity * t.rate!);
    });

    res.json({
      todaysProductionCount: todayProductionCount,
      todaysKitchenRequestsCount: todayRequests.length,
      pendingKitchenRequestsCount: pendingRequests,
      itemsIssuedTodayQty: Math.round(itemsIssuedTodayQty * 100) / 100,
      itemsIssuedTodayValue: Math.round(itemsIssuedTodayValue * 100) / 100,
      productionCostToday: Math.round(todayProductionCost * 100) / 100,
      wastageTodayQty: Math.round(wastageTodayQty * 100) / 100,
      wastageTodayValue: Math.round(wastageTodayValue * 100) / 100,
      productionVariance: Math.round(avgProductionVariance * 10) / 10
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
