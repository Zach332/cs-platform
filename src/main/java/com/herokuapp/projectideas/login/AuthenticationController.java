package com.herokuapp.projectideas.login;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.herokuapp.projectideas.database.documents.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import okhttp3.*;

@RestController
public class AuthenticationController {
    @Autowired
    LoginController loginController;
    
    private static final OkHttpClient httpClient = new OkHttpClient();

    static class GitHubCode {
        String code;
        public GitHubCode() {
        }
        public void setCode(String code) {
            this.code = code;
        }
    }

    static class Email {
        String email;
        public Email() {
        }
        public void setEmail(String email) {
            this.email = email;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class GithubEmail {
        public String email;
        public boolean primary;
        public boolean verified;
        public GithubEmail() {
        }
    }

    @PostMapping("/api/login/email")
    public User emailAuthentication(@RequestBody Email email) {
        return loginController.getUserByEmail(email.email);
    }

    @PostMapping("/api/login/github")
    public User githubAuthentication(@RequestBody GitHubCode code) {
        FormBody formBody = new FormBody.Builder()
            .add("client_id", System.getenv("REACT_APP_GITHUB_CLIENT_ID"))
            .add("client_secret", System.getenv("GITHUB_CLIENT_SECRET"))
            .add("code", code.code)
            .add("redirect_uri", System.getenv("REACT_APP_GITHUB_REDIRECT_URI"))
            .build();

        Request request = new Request.Builder()
            .url("https://github.com/login/oauth/access_token")
            .post(formBody)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.out.println("Unexpected code " + response);
                return null;
            }
            HttpUrl url = HttpUrl.parse("https://randomaddress.com/search?"+response.body().string());
            String token = url.queryParameter("access_token");
            String userResponse = getUserEmail(token);

            ObjectMapper mapper = new ObjectMapper();
            GithubEmail[] emails = mapper.readValue(userResponse, GithubEmail[].class);
            GithubEmail primary = getPrimary(emails);

            return loginController.getUserByEmail(primary.email);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    static String getUserEmail(String token) throws IOException {
        Request request = new Request.Builder()
            .url("https://api.github.com/user/emails")
            .header("Authorization","token " + token)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.out.println("Unexpected code " + response);
                return null;
            }
            return response.body().string();
        }
    }

    static GithubEmail getPrimary(GithubEmail[] emails) {
        for(GithubEmail email : emails) {
            if(email.primary)return email;
        }
        return emails[0];
    }
}