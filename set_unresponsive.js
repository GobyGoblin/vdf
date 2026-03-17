import { User } from './server/models/index.js';

async function setUnresponsive() {
  try {
    await User.sequelize.sync(); // Just sync normally
    const user = await User.findOne({ where: { email: 'inactive@example.com' } });
    if (user) {
      await user.update({
        isHiddenByUnresponsiveness: true,
        isDeactivated: true,
        showReactivationPopup: false
      });
      console.log('✅ Michael Chen (michael@example.com) is now marked as UNRESPONSIVE (Hidden & Deactivated).');
      console.log('To test the reactivation: Login as michael@example.com / password123');
    } else {
      console.log('❌ User michael@example.com not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

setUnresponsive();
