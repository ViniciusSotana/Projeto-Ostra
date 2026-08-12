package dev.ostra.projetoostra.sale.jewelrycase;

import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import dev.ostra.projetoostra.catalog.jewelry.JewelryRepository;
import dev.ostra.projetoostra.people.seller.Seller;
import dev.ostra.projetoostra.people.seller.SellerRepository;
import dev.ostra.projetoostra.sale.jewelrycaseitem.JewelryCaseItem;
import dev.ostra.projetoostra.sale.jewelrycaseitem.JewelryCaseItemRequestDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JewelryCaseService {

    private final JewelryCaseRepository repository;
    private final JewelryCaseMapper mapper;
    private final SellerRepository sellerRepository;
    private final JewelryRepository jewelryRepository;

    public JewelryCaseService(JewelryCaseRepository repository, JewelryCaseMapper mapper, SellerRepository sellerRepository, JewelryRepository jewelryRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.sellerRepository = sellerRepository;
        this.jewelryRepository = jewelryRepository;
    }

    @Transactional
    public JewelryCaseResponseDTO create(JewelryCaseRequestDTO request) {
        Seller seller = null;
        if (request.sellerId() != null) {
            seller = sellerRepository.findById(request.sellerId())
                    .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + request.sellerId()));
        }

        JewelryCase jewelryCase = mapper.toEntity(request, seller);

        if (request.items() != null && !request.items().isEmpty()) {
            for (JewelryCaseItemRequestDTO itemDto : request.items()) {
                Jewelry jewelry = jewelryRepository.findById(itemDto.jewelryId())
                        .orElseThrow(() -> new RuntimeException("Joia não encontrada com o ID: " + itemDto.jewelryId()));

                jewelryCase.addItem(new JewelryCaseItem(jewelry, itemDto.quantity()));
            }
        }

        jewelryCase = repository.save(jewelryCase);
        return mapper.toDTO(jewelryCase);
    }

    public List<JewelryCaseResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public JewelryCaseResponseDTO findById(UUID id) {
        JewelryCase jewelryCase = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maleta não encontrada com o ID: " + id));
        return mapper.toDTO(jewelryCase);
    }

    @Transactional
    public JewelryCaseResponseDTO update(UUID id, JewelryCaseRequestDTO request) {
        JewelryCase jewelryCase = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maleta não encontrada com o ID: " + id));

        Seller seller = null;
        if (request.sellerId() != null) {
            seller = sellerRepository.findById(request.sellerId())
                    .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + request.sellerId()));
        }

        jewelryCase.setCode(request.code());
        jewelryCase.setDescription(request.description());
        jewelryCase.setSeller(seller);

        jewelryCase.getItems().clear();
        if (request.items() != null && !request.items().isEmpty()) {
            for (JewelryCaseItemRequestDTO itemDto : request.items()) {
                Jewelry jewelry = jewelryRepository.findById(itemDto.jewelryId())
                        .orElseThrow(() -> new RuntimeException("Joia não encontrada com o ID: " + itemDto.jewelryId()));

                jewelryCase.addItem(new JewelryCaseItem(jewelry, itemDto.quantity()));
            }
        }

        jewelryCase = repository.save(jewelryCase);
        return mapper.toDTO(jewelryCase);
    }

    public void delete(UUID id) {
        JewelryCase jewelryCase = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maleta não encontrada com o ID: " + id));
        repository.delete(jewelryCase);
    }
}