package dev.ostra.projetoostra.catalog.jewelrytype;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JewelryTypeService {

    private final JewelryTypeRepository repository;
    private final JewelryTypeMapper mapper;

    public JewelryTypeService(JewelryTypeRepository repository, JewelryTypeMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public JewelryTypeResponseDTO create(JewelryTypeRequestDTO request) {
        JewelryType jewelryType = mapper.toEntity(request);
        jewelryType = repository.save(jewelryType);
        return mapper.toDTO(jewelryType);
    }

    public List<JewelryTypeResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public JewelryTypeResponseDTO findById(UUID id) {
        JewelryType jewelryType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de joia não encontrado com o ID: " + id));
        return mapper.toDTO(jewelryType);
    }

    public JewelryTypeResponseDTO update(UUID id, JewelryTypeRequestDTO request) {
        JewelryType jewelryType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de joia não encontrado com o ID: " + id));

        jewelryType.setName(request.name());
        jewelryType.setDescription(request.description());

        jewelryType = repository.save(jewelryType);
        return mapper.toDTO(jewelryType);
    }

    public void delete(UUID id) {
        JewelryType jewelryType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de joia não encontrado com o ID: " + id));
        repository.delete(jewelryType);
    }
}