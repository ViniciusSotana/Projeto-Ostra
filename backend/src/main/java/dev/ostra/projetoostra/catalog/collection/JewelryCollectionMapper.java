package dev.ostra.projetoostra.catalog.collection;

import org.springframework.stereotype.Component;

@Component
public class JewelryCollectionMapper {

    public JewelryCollection toEntity(JewelryCollectionRequestDTO dto) {
        return new JewelryCollection(
                dto.name(),
                dto.description(),
                dto.launchDate()
        );
    }

    public JewelryCollectionResponseDTO toDTO(JewelryCollection entity) {
        return new JewelryCollectionResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getLaunchDate()
        );
    }
}
