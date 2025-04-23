import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

const bootstrap = new BootstrapConsole({
  module: AppModule,
  useDecorators: true,
});

async function boot() {
  const context = await bootstrap.init();
  try {
    await context.init();
    await bootstrap.boot();
    await context.close();
  } catch (e) {
    console.error(e);
    await context.close();
    process.exit(1);
  }
}

boot().catch((err) => console.error('Err:', err));
