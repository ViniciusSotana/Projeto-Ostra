package dev.ostra.projetoostra.sale.sale;

import dev.ostra.projetoostra.catalog.jewelry.Jewelry;
import dev.ostra.projetoostra.catalog.jewelry.JewelryRepository;
import dev.ostra.projetoostra.people.client.Client;
import dev.ostra.projetoostra.people.client.ClientRepository;
import dev.ostra.projetoostra.people.seller.Seller;
import dev.ostra.projetoostra.people.seller.SellerRepository;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCase;
import dev.ostra.projetoostra.sale.jewelrycase.JewelryCaseRepository;
import dev.ostra.projetoostra.sale.jewelrycaseitem.JewelryCaseItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SaleService {

    private final SaleRepository repository;
    private final ClientRepository clientRepository;
    private final SellerRepository sellerRepository;
    private final JewelryRepository jewelryRepository;
    private final SaleMapper mapper;
    private final JewelryCaseRepository jewelryCaseRepository;

    public SaleService(SaleRepository repository, ClientRepository clientRepository, SellerRepository sellerRepository, JewelryRepository jewelryRepository, SaleMapper mapper, JewelryCaseRepository jewelryCaseRepository) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.sellerRepository = sellerRepository;
        this.jewelryRepository = jewelryRepository;
        this.mapper = mapper;
        this.jewelryCaseRepository = jewelryCaseRepository;
    }

    @Transactional
    public SaleResponseDTO create(SaleRequestDTO request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Seller seller = null;
        JewelryCase jewelryCase = null;

        if (request.sellerId() != null) {
            seller = sellerRepository.findById(request.sellerId())
                    .orElseThrow(() -> new RuntimeException("Vendedora não encontrada"));

            jewelryCase = jewelryCaseRepository.findBySellerId(seller.getId())
                    .orElseThrow(() -> new RuntimeException("A vendedora selecionada não possui uma maleta cadastrada."));
        }

        Sale sale = new Sale(client, seller);

        for (SaleItemRequestDTO itemDTO : request.items()) {
            Jewelry jewelry = jewelryRepository.findById(itemDTO.jewelryId())
                    .orElseThrow(() -> new RuntimeException("Joia não encontrada: " + itemDTO.jewelryId()));

            jewelry.atualizarEstoque(itemDTO.quantity());
            jewelryRepository.save(jewelry);

            if (jewelryCase != null) {
                JewelryCaseItem caseItem = jewelryCase.getItems().stream()
                        .filter(i -> i.getJewelry().getId().equals(jewelry.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("A joia " + jewelry.getName() + " não foi encontrada na maleta desta vendedora."));

                int novaQuantidade = caseItem.getQuantity() - itemDTO.quantity();

                if (novaQuantidade < 0) {
                    throw new RuntimeException("Estoque insuficiente na maleta para a joia: " + jewelry.getName());
                } else if (novaQuantidade == 0) {
                    jewelryCase.getItems().remove(caseItem);
                } else {
                    caseItem.setQuantity(novaQuantidade);
                }
            }

            SaleItem saleItem = new SaleItem(jewelry, itemDTO.quantity(), jewelry.getSellingPrice());
            sale.addItem(saleItem);
        }

        if (jewelryCase != null) {
            jewelryCaseRepository.save(jewelryCase);
        }

        sale = repository.save(sale);

        if (seller != null) {
            seller.setSoldValue(seller.getSoldValue().add(sale.getTotalAmount()));
            seller.calcularComissao();
            seller.setSalesCount(seller.getSalesCount() + 1);
            sellerRepository.save(seller);
        }

        BigDecimal totalGastoAtual = client.getTotalSpent() != null ? client.getTotalSpent() : BigDecimal.ZERO;
        client.setTotalSpent(totalGastoAtual.add(sale.getTotalAmount()));
        clientRepository.save(client);

        return mapper.toDTO(sale);
    }

    public List<SaleResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public SaleResponseDTO findById(UUID id) {
        Sale sale = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
        return mapper.toDTO(sale);
    }

    @Transactional
    public void delete(UUID id) {
        Sale sale = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada com o ID: " + id));

        if ("CANCELADA".equals(sale.getStatus())) {
            throw new RuntimeException("Esta venda já está cancelada.");
        }

        Client client = sale.getClient();
        if (client != null) {
            BigDecimal totalGastoAtual = client.getTotalSpent() != null ? client.getTotalSpent() : BigDecimal.ZERO;
            BigDecimal novoTotal = totalGastoAtual.subtract(sale.getTotalAmount());

            if (novoTotal.compareTo(BigDecimal.ZERO) < 0) novoTotal = BigDecimal.ZERO;

            client.setTotalSpent(novoTotal);
            clientRepository.save(client);
        }

        Seller seller = sale.getSeller();
        JewelryCase jewelryCase = null;

        if (seller != null) {
            BigDecimal valorVendidoAtual = seller.getSoldValue() != null ? seller.getSoldValue() : BigDecimal.ZERO;
            BigDecimal novoValorVendido = valorVendidoAtual.subtract(sale.getTotalAmount());

            if (novoValorVendido.compareTo(BigDecimal.ZERO) < 0) novoValorVendido = BigDecimal.ZERO;

            seller.setSoldValue(novoValorVendido);
            seller.setSalesCount(Math.max(0, seller.getSalesCount() - 1));
            seller.calcularComissao();
            sellerRepository.save(seller);

            jewelryCase = jewelryCaseRepository.findBySellerId(seller.getId()).orElse(null);
        }

        for (SaleItem saleItem : sale.getItems()) {
            Jewelry jewelry = saleItem.getJewelry();

            jewelry.setStockQuantity(jewelry.getStockQuantity() + saleItem.getQuantity());
            jewelryRepository.save(jewelry);

            if (jewelryCase != null) {
                JewelryCaseItem caseItemEncontrado = jewelryCase.getItems().stream()
                        .filter(i -> i.getJewelry().getId().equals(jewelry.getId()))
                        .findFirst()
                        .orElse(null);

                if (caseItemEncontrado != null) {
                    caseItemEncontrado.setQuantity(caseItemEncontrado.getQuantity() + saleItem.getQuantity());
                } else {
                    jewelryCase.addItem(new JewelryCaseItem(jewelry, saleItem.getQuantity()));
                }
            }
        }

        if (jewelryCase != null) {
            jewelryCaseRepository.save(jewelryCase);
        }

        sale.setStatus("CANCELADA");
        repository.save(sale);
    }
}