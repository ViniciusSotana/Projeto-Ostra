package dev.ostra.projetoostra.sale.jewelrycaseitem;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record JewelryCaseItemRequestDTO(
        @NotNull(message = "O ID da joia é obrigatório")
        UUID jewelryId,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade mínima é 1")
        Integer quantity
) {
}