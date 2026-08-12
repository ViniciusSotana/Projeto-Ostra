package dev.ostra.projetoostra.people.client;

import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequestDTO dto) {
        return new Client(
                dto.name(),
                dto.email(),
                dto.cpf(),
                dto.phone(),
                dto.address()
        );
    }

    public ClientResponseDTO toDTO(Client entity) {
        return new ClientResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getCpf(),
                entity.getPhone(),
                entity.getAddress(),
                entity.getTotalSpent()
        );
    }
}