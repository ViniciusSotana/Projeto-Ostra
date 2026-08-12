package dev.ostra.projetoostra.people.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClientRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String name,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "Formato de e-mail inválido")
        String email,

        @NotBlank(message = "O cpf é obrigatório")
        @Size(min = 11, max = 11)
        String cpf,

        @NotBlank(message = "O telefone é obrigatório")
        @Size(min = 11, max = 11)
        String phone,
        String address
) {
}