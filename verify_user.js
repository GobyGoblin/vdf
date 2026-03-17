import { User } from './server/models/index.js';

async function verify() {
  const user = await User.findOne({ where: { email: 'inactive@example.com' } });
  if (user) {
    console.log('User State:', {
      email: user.email,
      isHiddenByUnresponsiveness: user.isHiddenByUnresponsiveness,
      showReactivationPopup: user.showReactivationPopup,
      isDeactivated: user.isDeactivated
    });
  } else {
    console.log('User not found');
  }
  process.exit(0);
}

verify();
