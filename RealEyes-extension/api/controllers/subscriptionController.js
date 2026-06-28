import User from '../models/User.js';

export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessionsLimit = user.plan === 'premium' ? null : 20;
    const sessionsRemaining = user.plan === 'premium' ? null : Math.max(0, 20 - user.sessionsUsed);

    res.json({
      plan: user.plan,
      sessionsUsed: user.sessionsUsed,
      sessionsLimit,
      sessionsRemaining,
      billingCycleStart: user.billingCycleStart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.plan = 'premium';
    user.billingCycleStart = new Date();
    user.sessionsUsed = 0;
    await user.save();

    res.json({
      message: 'Plan upgraded to premium',
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const consumeSession = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.plan !== 'premium' && user.sessionsUsed >= 20) {
      return res.status(403).json({
        message: 'Monthly session limit reached. Upgrade to Premium for unlimited access.',
        limitReached: true,
      });
    }

    if (user.plan !== 'premium') {
      user.sessionsUsed += 1;
      await user.save();
    }

    res.json({
      sessionsUsed: user.sessionsUsed,
      sessionsRemaining: user.plan === 'premium' ? null : Math.max(0, 20 - user.sessionsUsed),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
