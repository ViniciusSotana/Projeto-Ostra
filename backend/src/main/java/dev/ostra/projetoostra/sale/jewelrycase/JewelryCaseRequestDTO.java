package dev.ostra.projetoostra.sale.jewelrycase;

import dev.ostra.projetoostra.sale.jewelrycaseitem.JewelryCaseItemRequestDTO;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record JewelryCaseRequestDTO(
        @NotBlank(message = "O código da maleta é obrigatório")
        String code,

        String description,

        UUID sellerId,

        List<JewelryCaseItemRequestDTO>items
) {
}