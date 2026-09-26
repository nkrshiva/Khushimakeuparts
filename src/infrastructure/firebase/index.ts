/**
 * Firebase Infrastructure Entrypoint
 *
 * Centralized infrastructure boundary encapsulating Firebase SDK runtime singletons.
 * Repositories and infrastructure adapters consume Firebase instances through this module.
 */

export { app, auth, db, storage } from '../../firebase';
