package dev.ostra.projetoostra.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, String> uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return Map.of(
                    "url", uploadResult.get("secure_url").toString(),
                    "public_id", uploadResult.get("public_id").toString()
            );
        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload da imagem para o Cloudinary", e);
        }
    }

    public void deleteImage(String publicId) {
        try {
            if (publicId != null && !publicId.isBlank()) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (IOException e) {
            throw new RuntimeException("Erro ao deletar imagem do Cloudinary", e);
        }
    }
}