package dev.ostra.projetoostra.people.client;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ClientRepository repository;
    private final ClientMapper mapper;

    public ClientService(ClientRepository repository, ClientMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ClientResponseDTO create(ClientRequestDTO request) {
        Client client = mapper.toEntity(request);
        client = repository.save(client);
        return mapper.toDTO(client);
    }

    public List<ClientResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    public ClientResponseDTO findById(UUID id) {
        Client client = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o ID: " + id));
        return mapper.toDTO(client);
    }

    public ClientResponseDTO update(UUID id, ClientRequestDTO request) {
        Client client = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o ID: " + id));

        client.setName(request.name());
        client.setEmail(request.email());
        client.setCpf(request.cpf());
        client.setPhone(request.phone());
        client.setAddress(request.address());

        client = repository.save(client);
        return mapper.toDTO(client);
    }

    public void delete(UUID id) {
        Client client = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com o ID: " + id));
        repository.delete(client);
    }
}