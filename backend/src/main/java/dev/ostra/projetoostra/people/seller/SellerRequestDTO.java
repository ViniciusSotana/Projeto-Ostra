package dev.ostra.projetoostra.people.seller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SellerRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String name,

        String email,

        @Size(min = 11, max = 11)
        String cpf,

        @NotBlank(message = "O telefone é obrigatório")
        @Size(min = 11, max = 11)
        String phone,

        @NotNull(message = "A taxa de comissão é obrigatória (ex: 15.0 para 15%)")
        BigDecimal commissionRate,

        Boolean isActive
) {
}