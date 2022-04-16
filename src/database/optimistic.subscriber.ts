// OptimisticLockingSubscriber.ts
import { EntitySubscriberInterface, EventSubscriber, ObjectLiteral, UpdateEvent } from "typeorm";

const EXPECTED_VERSION_METADATA = Symbol();

@EventSubscriber()
export class OptimisticLockingSubscriber implements EntitySubscriberInterface {
  beforeUpdate(event: UpdateEvent<any>) {
    // We only deal with entities which have a version number.
    // To know if an entity has a version number, we check if versionColumn
    // is defined in the metadatas of that entity.
    if (event.metadata.versionColumn) {
      // Getting the current version of the entity
      const currentVersion = Reflect.get(
        event.entity,
        event.metadata.versionColumn.propertyName,
      );
      // Calculating the version we expect after the update
      const expectedVersionAfterUpdate = parseInt(currentVersion, 10) + 1;

      // We memorize the expected version as a metadata on the entity
      Reflect.defineMetadata(
        EXPECTED_VERSION_METADATA,
        expectedVersionAfterUpdate,
        event.entity,
      );
    }
  }

  afterUpdate(event: UpdateEvent<any>) {
    // We only deal with entities which have a version number.
    // To know if an entity has a version number, we check if versionColumn
    // is defined in the metadatas of that entity.
    if (event.metadata.versionColumn) {
      // We retrieve the expected version previously memorized as a metadata on the entity
      const expectedVersion = Reflect.getOwnMetadata(
        EXPECTED_VERSION_METADATA,
        event.entity,
      );

      // We don't need that metadata anymore, we delete it
      Reflect.deleteMetadata(EXPECTED_VERSION_METADATA, event.entity);

      // Getting the actual version of the entity
      const actualVersion = parseInt(
        Reflect.get(event.entity, event.metadata.versionColumn.propertyName),
        10,
      );

      // We check if there is version mismatch
      if (expectedVersion !== actualVersion) {
        throw new OptimisticLockVersionMismatchError(
          event.entity,
          expectedVersion,
          actualVersion,
        );
      }
    }
  }
}

class OptimisticLockVersionMismatchError extends Error {
  name = "OptimisticLockVersionMismatchError";
  constructor(entity: ObjectLiteral | undefined, expectedVersion: number, actualVersion: number) {
    super();
    Reflect.setPrototypeOf(this, OptimisticLockVersionMismatchError.prototype);
    this.message = "WRONG_VERSION_NO";
  }
}
