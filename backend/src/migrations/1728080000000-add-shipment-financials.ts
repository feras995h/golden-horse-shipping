import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddShipmentFinancials1728080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // additionalCharges
    await queryRunner.addColumn(
      'shipments',
      new TableColumn({
        name: 'additionalCharges',
        type: queryRunner.connection.options.type === 'sqlite' ? 'decimal' : 'numeric',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      })
    );

    // adminAmountPaid
    await queryRunner.addColumn(
      'shipments',
      new TableColumn({
        name: 'adminAmountPaid',
        type: queryRunner.connection.options.type === 'sqlite' ? 'decimal' : 'numeric',
        precision: 10,
        scale: 2,
        isNullable: false,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shipments', 'adminAmountPaid');
    await queryRunner.dropColumn('shipments', 'additionalCharges');
  }
}
