package dev.ostra.projetoostra.catalog.collection;

import java.time.LocalDate;
import java.util.UUID;

public record JewelryCollectionResponseDTO(
        UUID id,
        String name,
        String description,
        LocalDate launchDate
) {
}