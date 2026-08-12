package dev.ostra.projetoostra.catalog.collection;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record JewelryCollectionRequestDTO(
        @NotBlank(message = "O nome da coleção é obrigatório")
        String name,

        String description,

        LocalDate launchDate
) {
}