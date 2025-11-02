"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDomainModel = toDomainModel;
function toDomainModel(entity) {
    const now = new Date();
    return {
        id: entity.id,
        uuid: entity.uuid,
        name: entity.name,
        start_date: entity.start_date,
        end_date: entity.end_date,
        available_seats: entity.available_seats,
        description: entity.description,
        ticket_type_id: entity.ticket_type_id,
        event_type: entity.event_type,
        category_id: entity.category_id,
        status: entity.status,
        created_at: entity.created_at || now,
        updated_at: entity.updated_at || now,
    };
}
