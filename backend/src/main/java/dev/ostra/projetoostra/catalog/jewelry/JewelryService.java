package dev.ostra.projetoostra.catalog.jewelry;

import dev.ostra.projetoostra.catalog.collection.JewelryCollection;
import dev.ostra.projetoostra.catalog.collection.JewelryCollectionRepository;
import dev.ostra.projetoostra.catalog.jewelrytype.JewelryType;
import dev.ostra.projetoostra.catalog.jewelrytype.JewelryTypeRepository;
import dev.ostra.projetoostra.config.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JewelryService {

    private final JewelryRepository repository;
    private final JewelryTypeRepository typeRepository;
    private final JewelryCollectionRepository collectionRepository;
    private final JewelryMapper mapper;
    private final CloudinaryService cloudinaryService;

    public JewelryService(JewelryRepository repository, JewelryTypeRepository typeRepository, JewelryCollectionRepository collectionRepository, JewelryMapper mapper, CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.typeRepository = typeRepository;
        this.collectionRepository = collectionRepository;
        this.mapper = mapper;
        this.cloudinaryService = cloudinaryService;
    }

    public JewelryResponseDTO create(JewelryRequestDTO request, MultipartFile image) {
        JewelryType type = typeRepository.findById(request.typeId())
                .orElseThrow(() -> new RuntimeException("Tipo de joia não encontrado"));

        JewelryCollection collection = null;
        if (request.collectionId() != null) {
            collection = collectionRepository.findById(request.collectionId())
                    .orElseThrow(() -> new RuntimeException("Coleção não encontrada"));
        }

        Map<String, String> uploadResult = cloudinaryService.uploadImage(image);
        String imageUrl = uploadResult.get("url");
        String publicId = uploadResult.get("public_id");

        Jewelry jewelry = mapper.toEntity(request, imageUrl, publicId, type, collection);
        jewelry = repository.save(jewelry);
        return mapper.toDTO(jewelry);
    }

    public List<JewelryResponseDTO> findAll(UUID typeId, UUID collectionId, Boolean isPromo) {
        List<Jewelry> jewelries = repository.searchJewelries(typeId, collectionId, isPromo);

        return jewelries.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public JewelryResponseDTO findById(UUID id) {
        Jewelry jewelry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joia não encontrada"));
        return mapper.toDTO(jewelry);
    }

    public JewelryResponseDTO update(UUID id, JewelryRequestDTO request, MultipartFile image) {
        Jewelry jewelry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joia não encontrada"));

        JewelryType type = typeRepository.findById(request.typeId())
                .orElseThrow(() -> new RuntimeException("Tipo de joia não encontrado"));

        JewelryCollection collection = null;
        if (request.collectionId() != null) {
            collection = collectionRepository.findById(request.collectionId())
                    .orElseThrow(() -> new RuntimeException("Coleção não encontrada"));
        }

        jewelry.setName(request.name());
        jewelry.setSku(request.sku());
        jewelry.setDescription(request.description());

        jewelry.setOriginalPrice(request.originalPrice());
        jewelry.setSellingPrice(request.sellingPrice());
        jewelry.setStockQuantity(request.stockQuantity());

        if (request.discountValue() != null) {
            jewelry.setDiscountValue(request.discountValue());
        } else {
            jewelry.setDiscountValue(BigDecimal.ZERO);
        }

        jewelry.setType(type);
        jewelry.setCollection(collection);

        if (image != null && !image.isEmpty()) {
            cloudinaryService.deleteImage(jewelry.getImagePublicId());

            Map<String, String> uploadResult = cloudinaryService.uploadImage(image);
            jewelry.setImageUrl(uploadResult.get("url"));
            jewelry.setImagePublicId(uploadResult.get("public_id"));
        }

        jewelry = repository.save(jewelry);
        return mapper.toDTO(jewelry);
    }

    public void delete(UUID id) {
        Jewelry jewelry = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Joia não encontrada"));

        cloudinaryService.deleteImage(jewelry.getImagePublicId());

        repository.delete(jewelry);
    }
}