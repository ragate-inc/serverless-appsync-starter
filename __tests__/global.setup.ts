import { config } from 'dotenv';

config({ path: `${process.cwd()}/__tests__/.env` });

export default () => {
  try {
    //
  } catch (e) {
    const err = e as unknown as Error;
    console.log(err.name);
    console.log(err.message);
    console.log(err.stack);
  }
};
