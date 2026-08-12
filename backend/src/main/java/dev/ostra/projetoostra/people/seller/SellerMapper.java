package dev.ostra.projetoostra.people.seller;

import org.springframework.stereotype.Component;

@Component
public class SellerMapper {

    public Seller toEntity(SellerRequestDTO dto) {
        return new Seller(
                dto.name(),
                dto.email(),
                dto.cpf(),
                dto.phone(),
                dto.commissionRate()
        );
    }

    public SellerResponseDTO toDTO(Seller entity) {
        return new SellerResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getCpf(),
                entity.getPhone(),
                entity.getCommission(),
                entity.getCommissionRate(),
                entity.getSoldValue(),
                entity.getIsActive(),
                entity.getSalesCount()
        );
    }
}