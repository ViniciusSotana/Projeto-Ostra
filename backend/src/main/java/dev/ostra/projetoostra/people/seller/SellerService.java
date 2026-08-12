package dev.ostra.projetoostra.people.seller;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SellerService {

    private final SellerRepository repository;
    private final SellerMapper mapper;

    public SellerService(SellerRepository repository, SellerMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public SellerResponseDTO create(SellerRequestDTO request) {
        Seller seller = mapper.toEntity(request);
        if (seller.getIsActive() == null) {
            seller.setIsActive(true);
        }
        seller = repository.save(seller);
        return mapper.toDTO(seller);
    }

    public List<SellerResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public SellerResponseDTO findById(UUID id) {
        Seller seller = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + id));
        return mapper.toDTO(seller);
    }

    public SellerResponseDTO update(UUID id, SellerRequestDTO request) {
        Seller seller = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + id));

        seller.setName(request.name());
        seller.setEmail(request.email());
        seller.setCpf(request.cpf());
        seller.setPhone(request.phone());
        seller.setCommissionRate(request.commissionRate());

        if (request.isActive() != null) {
            seller.setIsActive(request.isActive());
        }

        seller = repository.save(seller);
        return mapper.toDTO(seller);
    }

    public void delete(UUID id) {
        Seller seller = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + id));
        seller.setIsActive(false);
        repository.save(seller);
    }

    public void payCommission(UUID id) {
        Seller seller = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendedora não encontrada com o ID: " + id));

        seller.setSoldValue(BigDecimal.ZERO);
        seller.setCommission(BigDecimal.ZERO);
        seller.setSalesCount(0);

        repository.save(seller);
    }
}