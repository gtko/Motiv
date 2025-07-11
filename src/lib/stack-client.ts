import { StackProvider, StackTheme } from '@stackframe/stack';
import { stackServerApp } from './stack';

export { StackProvider, StackTheme };
export const stackApp = stackServerApp.getClientApp();