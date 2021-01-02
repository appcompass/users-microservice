import * as vault from 'node-vault';

export const getVaultConfig = async () => {
  const client = vault({
    token: process.env.VAULT_TOKEN
  });
  try {
    const [
      serviceHost,
      servicePort,
      natsUrl,
      publicKey,
      natsQueue,
      dbType,
      dbHost,
      dbPort,
      dbSchema,
      dbUser,
      dbPassword,
      dbName,
      dbSyncronize
    ] = await Promise.all(
      [
        'secret/service/shared/usersServiceHost',
        'secret/service/shared/usersServicePort',
        'secret/service/shared/natsUrl',
        'secret/service/shared/publicKey',
        'secret/service/users/natsQueue',
        'secret/service/users/dbType',
        'secret/service/users/dbHost',
        'secret/service/users/dbPort',
        'secret/service/users/dbSchema',
        'secret/service/users/dbUser',
        'secret/service/users/dbPassword',
        'secret/service/users/dbName',
        'secret/service/users/dbSyncronize'
      ].map((path) => client.read(path).then(({ data }) => data.value))
    );
    return {
      serviceHost,
      servicePort,
      natsUrl,
      publicKey,
      natsQueue,
      dbType,
      dbHost,
      dbPort,
      dbSchema,
      dbUser,
      dbPassword,
      dbName,
      dbSyncronize
    };
  } catch (error) {
    throw Error(error.response.body.warnings);
  }
};
