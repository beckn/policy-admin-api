
const path =require('path');
const dotenv=require('dotenv')
const z=require('zod')

console.log("process.env:::", process.env)

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.join(__dirname, '../../.env.development') });
  }
  
  if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: path.join(__dirname, '../../../.env.production') });
  }

  const environmentSchema = z.object({
    NODE_ENV: z.union([
      z.literal('production'),
      z.literal('development'),
      z.literal('test'),
    ]),
    PORT: z
      .string()
      .default('8080')
      .transform((str) => parseInt(str, 10)),
    DATABASE_URL: z.string().describe('Mongodb URI'),
  
  });


const environmentVariables = environmentSchema.parse(process.env);
const config={
    NODE_ENV: environmentVariables.NODE_ENV,
    PORT: environmentVariables.PORT,
    DATABASE_URL: environmentVariables.DATABASE_URL,
  
}
module.exports = config;