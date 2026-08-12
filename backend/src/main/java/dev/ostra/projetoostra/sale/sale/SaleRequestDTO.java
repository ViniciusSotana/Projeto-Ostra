package dev.ostra.projetoostra.sale.sale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record SaleRequestDTO(
        @NotNull(message = "O ID do cliente é obrigatório")
        UUID clientId,

        UUID sellerId,

        @NotEmpty(message = "A venda deve conter pelo menos um item")
        List<@Valid SaleItemRequestDTO> items
) {
}