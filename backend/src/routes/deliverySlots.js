const express = require('express');
const { Shop, Order } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');

const router = express.Router();

// Predefined delivery slots
const DELIVERY_SLOTS = [
  { time: '9am-12pm', label: '9:00 AM - 12:00 PM' },
  { time: '12pm-3pm', label: '12:00 PM - 3:00 PM' },
  { time: '3pm-6pm', label: '3:00 PM - 6:00 PM' },
  { time: '6pm-9pm', label: '6:00 PM - 9:00 PM' },
];

const MAX_ORDERS_PER_SLOT = 10; // Max orders per slot per day

// GET /api/delivery-slots - Get available delivery slots
router.get('/', async (req, res, next) => {
  try {
    const { shopId, date } = req.query;

    if (!shopId || !date) {
      throw new ValidationError('shopId and date are required');
    }

    // Validate shop exists
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      throw new NotFoundError('Shop not found');
    }

    // Parse date
    const slotDate = new Date(date);
    if (isNaN(slotDate)) {
      throw new ValidationError('Invalid date format (use YYYY-MM-DD)');
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (slotDate < today) {
      return res.json({ slots: [] }); // No slots for past dates
    }

    // Get orders for this shop and date
    const dayStart = new Date(slotDate);
    const dayEnd = new Date(slotDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const ordersPerSlot = {};
    for (const slot of DELIVERY_SLOTS) {
      ordersPerSlot[slot.time] = 0;
    }

    // Count orders per slot (simplified - assumes timeSlot field contains the slot time)
    const ordersOnDate = await Order.count({
      where: {
        shopId,
        createdAt: {
          [require('sequelize').Op.between]: [dayStart, dayEnd],
        },
      },
    });

    // Distribute orders across slots (simplified distribution)
    const ordersPerSlotCount = Math.floor(ordersOnDate / DELIVERY_SLOTS.length);
    for (const slot of DELIVERY_SLOTS) {
      ordersPerSlot[slot.time] = ordersPerSlotCount;
    }

    // Format response
    const slots = DELIVERY_SLOTS.map(slot => ({
      time: slot.time,
      label: slot.label,
      available: ordersPerSlot[slot.time] < MAX_ORDERS_PER_SLOT,
      ordersCount: ordersPerSlot[slot.time],
      maxCapacity: MAX_ORDERS_PER_SLOT,
    }));

    res.json({
      shopId,
      date: date,
      slots,
      message: `Delivery slots for ${shop.name} on ${date}`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
