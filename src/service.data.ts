export const roles = [
  {
    name: 'users.admin',
    label: 'Users Admin',
    description: 'Platform Users Administrator',
    permissions: [
      {
        name: 'users.user.create',
        label: 'Create User',
        description: 'Allows creation of users',
        system: true
      },
      {
        name: 'users.user.read',
        label: 'Read User',
        description: 'Allows viewing of users',
        system: true
      },
      {
        name: 'users.user.update',
        label: 'Update User',
        description: 'Allows updates to users',
        system: true
      },
      {
        name: 'users.user.delete',
        label: 'Delete User',
        description: 'Allows deletion of users',
        system: true
      }
    ]
  }
];
