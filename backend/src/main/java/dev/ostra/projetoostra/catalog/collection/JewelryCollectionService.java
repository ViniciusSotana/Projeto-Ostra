package dev.ostra.projetoostra.catalog.collection;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JewelryCollectionService {

    private final JewelryCollectionRepository repository;
    private final JewelryCollectionMapper mapper;

    public JewelryCollectionService(JewelryCollectionRepository repository, JewelryCollectionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public JewelryCollectionResponseDTO create(JewelryCollectionRequestDTO request) {

        if (repository.existsByNameIgnoreCase(request.name())) {
            throw new RuntimeException("Já existe uma coleção cadastrada com o nome: " + request.name());
        }

        JewelryCollection collection = mapper.toEntity(request);
        collection = repository.save(collection);
        return mapper.toDTO(collection);
    }

    public List<JewelryCollectionResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public JewelryCollectionResponseDTO findById(UUID id) {
        JewelryCollection collection = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coleção não encontrada com o ID: " + id));
        return mapper.toDTO(collection);
    }

    public JewelryCollectionResponseDTO update(UUID id, JewelryCollectionRequestDTO request) {
        JewelryCollection collection = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coleção não encontrada com o ID: " + id));

        Optional<JewelryCollection> existingCollection = repository.findByNameIgnoreCase(request.name());
        if (existingCollection.isPresent() && !existingCollection.get().getId().equals(id)) {
            throw new RuntimeException("Já existe outra coleção cadastrada com o nome: " + request.name());
        }

        collection.setName(request.name());
        collection.setDescription(request.description());
        collection.setLaunchDate(request.launchDate());

        collection = repository.save(collection);
        return mapper.toDTO(collection);
    }

    public void delete(UUID id) {
        JewelryCollection collection = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coleção não encontrada com o ID: " + id));
        repository.delete(collection);
    }
}
