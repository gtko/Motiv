/// <reference types="astro/client" />

import type { UserSession } from './lib/auth';

declare namespace App {
  interface Locals {
    user?: UserSession;
  }
}