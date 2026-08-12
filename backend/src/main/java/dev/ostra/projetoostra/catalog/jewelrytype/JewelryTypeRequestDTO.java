package dev.ostra.projetoostra.catalog.jewelrytype;

import jakarta.validation.constraints.NotBlank;

public record JewelryTypeRequestDTO(
        @NotBlank(message = "O nome do tipo de joia é obrigatório")
        String name,

        String description
) {
}