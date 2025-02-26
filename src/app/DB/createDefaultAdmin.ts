import config from '../config';
import { USER_ROLE } from '../modules/user/user.constants';
import { User } from '../modules/user/user.models';


const AdminUser = {
  fullName: 'Admin',
  email: config.admin_email,
  password: config.admin_password,
  phone: config.admin_phone,
  role: USER_ROLE.ADMIN,
  isDeleted: false,
  isActive: true,
};

const createDefaultAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const isseedAdminExits = await User.findOne({ role: USER_ROLE.ADMIN });

  if (!isseedAdminExits) {
    await User.create(AdminUser);
  }
};

export default createDefaultAdmin;