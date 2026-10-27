package com.ai.email.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaService {

    private static final Logger log = LoggerFactory.getLogger(OllamaService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ollama.api.url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model.name:llama3.2}")
    private String modelName;

    public OllamaService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public boolean isOllamaAvailable() {
        try {
            String url = ollamaBaseUrl + "/api/tags";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("Ollama connection check failed at {}: {}", ollamaBaseUrl, e.getMessage());
            return false;
        }
    }

    public Map<String, String> generateEmail(String userPrompt, String tone, String recipient, String userSubject) {
        String systemInstruction = getToneInstruction(tone);

        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append(systemInstruction).append("\n\n");
        if (recipient != null && !recipient.isBlank()) {
            fullPrompt.append("Recipient: ").append(recipient).append("\n");
        }
        if (userSubject != null && !userSubject.isBlank()) {
            fullPrompt.append("Proposed Subject: ").append(userSubject).append("\n");
        }
        fullPrompt.append("Core Message / Notes to convert into an email:\n").append(userPrompt).append("\n\n");
        fullPrompt.append("Output Format:\n");
        fullPrompt.append("Subject: [Your suggested subject line]\n\n");
        fullPrompt.append("[Email Body]\n");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", modelName);
        requestBody.put("prompt", fullPrompt.toString());
        requestBody.put("stream", false);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = ollamaBaseUrl + "/api/generate";
            log.info("Sending request to Ollama ({}) with tone: {}", modelName, tone);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String rawText = root.path("response").asText();
                return parseSubjectAndBody(rawText, userSubject);
            } else {
                throw new RuntimeException("Ollama returned non-200 status: " + response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error communicating with Ollama: {}", e.getMessage());
            // Fallback generation if Ollama fails or is temporarily busy
            return fallbackGeneration(userPrompt, tone, userSubject);
        }
    }

    private String getToneInstruction(String tone) {
        String safeTone = (tone != null) ? tone.toLowerCase().trim() : "professional";
        switch (safeTone) {
            case "casual":
                return "You are an AI email assistant. Convert the notes into a friendly, casual, and conversational email. Use a relaxed tone, natural conversational phrasing (e.g., 'Hey', 'Hope you are doing well', 'Cheers'). Do not include metadata or markdown fences.";
            case "friendly":
                return "You are an AI email assistant. Convert the notes into a warm, supportive, and collaborative email. Use encouraging, polite, and uplifting language with a warm closing (e.g., 'Warm regards'). Do not include metadata or markdown fences.";
            case "urgent":
                return "You are an AI email assistant. Convert the notes into an urgent, direct, and action-oriented email. Emphasize priority, deadlines, and immediate next steps clearly and respectfully. Do not include metadata or markdown fences.";
            case "professional":
            default:
                return "You are an expert executive email assistant. Convert the notes into a formal, highly professional, polite, and business-ready email. Use standard professional salutation (e.g., 'Dear [Name]', 'Hello') and closing (e.g., 'Best regards'). Do not include metadata or markdown fences.";
        }
    }

    private Map<String, String> parseSubjectAndBody(String rawText, String fallbackSubject) {
        Map<String, String> result = new HashMap<>();
        if (rawText == null || rawText.isBlank()) {
            result.put("subject", fallbackSubject != null && !fallbackSubject.isBlank() ? fallbackSubject : "Important Update");
            result.put("body", "");
            return result;
        }

        // Clean up common markdown artifacts like ```text or ```
        String cleaned = rawText.replaceAll("(?m)^```[a-zA-Z]*\\s*", "").replaceAll("(?m)^```\\s*$", "").trim();

        String subject = null;
        String body = cleaned;

        // Check if output starts with Subject:
        String[] lines = cleaned.split("\\r?\\n");
        int bodyStartIndex = 0;

        for (int i = 0; i < Math.min(lines.length, 4); i++) {
            String line = lines[i].trim();
            if (line.toLowerCase().startsWith("subject:")) {
                subject = line.substring(8).trim();
                bodyStartIndex = i + 1;
                break;
            }
        }

        if (subject != null) {
            StringBuilder sb = new StringBuilder();
            for (int i = bodyStartIndex; i < lines.length; i++) {
                sb.append(lines[i]).append("\n");
            }
            body = sb.toString().trim();
        } else {
            subject = (fallbackSubject != null && !fallbackSubject.isBlank()) ? fallbackSubject : "Email Correspondence";
        }

        result.put("subject", subject);
        result.put("body", body);
        return result;
    }

    private Map<String, String> fallbackGeneration(String prompt, String tone, String fallbackSubject) {
        Map<String, String> result = new HashMap<>();
        String safeSubject = (fallbackSubject != null && !fallbackSubject.isBlank()) ? fallbackSubject : "Update regarding your request";
        result.put("subject", safeSubject);

        String greeting = "Dear Recipient,";
        String signoff = "Best regards,\n[Your Name]";
        if ("casual".equalsIgnoreCase(tone)) {
            greeting = "Hey there,";
            signoff = "Cheers,\n[Your Name]";
        } else if ("friendly".equalsIgnoreCase(tone)) {
            greeting = "Hello friend,";
            signoff = "Warm regards,\n[Your Name]";
        } else if ("urgent".equalsIgnoreCase(tone)) {
            greeting = "Important Attention Required,";
            signoff = "Promptly,\n[Your Name]";
        }

        result.put("body", greeting + "\n\n" + prompt + "\n\n" + signoff);
        return result;
    }
}
