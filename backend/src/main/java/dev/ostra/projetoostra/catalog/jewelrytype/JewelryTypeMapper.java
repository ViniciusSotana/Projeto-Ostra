package dev.ostra.projetoostra.catalog.jewelrytype;

import org.springframework.stereotype.Component;

@Component
public class JewelryTypeMapper {

    public JewelryType toEntity(JewelryTypeRequestDTO dto) {
        return new JewelryType(
                dto.name(),
                dto.description()
        );
    }

    public JewelryTypeResponseDTO toDTO(JewelryType entity) {
        return new JewelryTypeResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription()
        );
    }
}