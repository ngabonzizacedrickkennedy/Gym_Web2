package com.sheshape.config;

import com.sheshape.security.JwtAuthenticationFilter;
import com.sheshape.security.JwtAuthorizationFilter;
import com.sheshape.security.JwtUtil;
import com.sheshape.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthorizationFilter jwtAuthorizationFilter;
    private final JwtUtil jwtUtil;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          JwtAuthorizationFilter jwtAuthorizationFilter,
                          JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthorizationFilter = jwtAuthorizationFilter;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        // Configure JWT filter
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(authenticationManager, jwtUtil);
        jwtAuthenticationFilter.setFilterProcessesUrl("/api/auth/login");

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - No authentication required
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/blog/posts").permitAll()
                        .requestMatchers("/api/blog/posts/{id}").permitAll()
                        .requestMatchers("/health","/actuator/**").permitAll()

                        // Public marketing endpoints
                        .requestMatchers("/api/trainers").permitAll()
                        .requestMatchers("/api/trainers/{id}").permitAll()
                        .requestMatchers("/api/nutritionists").permitAll()
                        .requestMatchers("/api/nutritionists/{id}").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/gym/programs").permitAll()
                        .requestMatchers("/api/gym/programs/{id}").permitAll()

                        // Swagger UI endpoints
                        .requestMatchers("/swagger-ui/**","/swagger-ui.html", "/swagger-resources/**",
                                "/v3/api-docs/**", "/v2/api-docs/**","/configuration/ui",
                                "/configuration/security","/webjars/**").permitAll()

                        // TEMPORARILY ALLOW UPLOADS FOR TESTING - REMOVE THIS LATER
                        .requestMatchers("/api/uploads/**").permitAll()

                        // Admin endpoints - Require ADMIN role
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Trainer-specific endpoints - Require TRAINER or ADMIN role
                        .requestMatchers(HttpMethod.POST, "/api/gym/programs").hasAnyRole("TRAINER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/gym/programs/{id}").hasAnyRole("TRAINER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/gym/programs/{id}").hasAnyRole("TRAINER", "ADMIN")

                        // Nutritionist-specific endpoints - Require NUTRITIONIST or ADMIN role
                        .requestMatchers("/api/nutrition/plans/new").hasAnyRole("NUTRITIONIST", "ADMIN")
                        .requestMatchers("/api/nutrition/plans/{id}/edit").hasAnyRole("NUTRITIONIST", "ADMIN")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .addFilter(jwtAuthenticationFilter)
                .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // FIXED: Replace deprecated .and() method
    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return new ProviderManager(provider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}