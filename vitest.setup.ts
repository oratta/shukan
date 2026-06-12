import { vi } from 'vitest';

// `server-only` throws when imported outside a React Server Component bundle.
// Under Vitest (node env) it is a harmless no-op so server-only modules
// (service-role admin clients) can be imported transitively by route tests.
vi.mock('server-only', () => ({}));
