package com.examly.springapp.config;

import com.examly.springapp.entity.Category;
import com.examly.springapp.entity.Product;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.repository.ProductRepository;
import com.examly.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Admin User
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@marketplace.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("9876543210");
            admin.setRole("ADMIN");
            userRepository.save(admin);

            // Vendor User
            User vendor = new User();
            vendor.setName("Aarav Tech");
            vendor.setEmail("vendor@techhub.com");
            vendor.setPassword(passwordEncoder.encode("Vendor@123"));
            vendor.setPhone("9123456789");
            vendor.setRole("VENDOR");
            vendor.setGstin("27AAAAA0000A1Z5");
            vendor.setPan("ABCDE1234F");
            vendor.setBankAccountNo("918273645012");
            vendor.setIfscCode("SBIN0001234");
            userRepository.save(vendor);

            // Customer User
            User customer = new User();
            customer.setName("Priya Sharma");
            customer.setEmail("customer@gmail.com");
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            customer.setPhone("9988776655");
            customer.setRole("CUSTOMER");
            userRepository.save(customer);

            // Category Manager
            User catManager = new User();
            catManager.setName("Rahul Verma");
            catManager.setEmail("catmanager@marketplace.com");
            catManager.setPassword(passwordEncoder.encode("Staff@123"));
            catManager.setPhone("9811223344");
            catManager.setRole("CATEGORY_MANAGER");
            userRepository.save(catManager);

            // Finance Officer
            User finance = new User();
            finance.setName("Neha Gupta");
            finance.setEmail("finance@marketplace.com");
            finance.setPassword(passwordEncoder.encode("Staff@123"));
            finance.setPhone("9711223344");
            finance.setRole("FINANCE_OFFICER");
            userRepository.save(finance);

            // Categories
            Category electronics = categoryRepository.save(new Category(null, "Electronics", new BigDecimal("18.00"), new BigDecimal("10.00"), 7));
            Category fashion = categoryRepository.save(new Category(null, "Fashion", new BigDecimal("12.00"), new BigDecimal("12.00"), 30));
            Category home = categoryRepository.save(new Category(null, "Home & Kitchen", new BigDecimal("18.00"), new BigDecimal("8.00"), 7));

            // Products
            Product p1 = new Product();
            p1.setVendorId(vendor.getId());
            p1.setName("Wireless Noise-Cancelling Headphones");
            p1.setCategoryId(electronics.getId());
            p1.setDescription("Premium Bluetooth 5.2 over-ear headphones with 30-hour battery life and active noise cancellation.");
            p1.setBasePrice(new BigDecimal("4999.00"));
            p1.setMrp(new BigDecimal("7999.00"));
            p1.setStock(45);
            p1.setGstRate(electronics.getGstRate());
            p1.setStatus("ACTIVE");
            p1.setImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80");
            productRepository.save(p1);

            Product p2 = new Product();
            p2.setVendorId(vendor.getId());
            p2.setName("Smart Fitness Watch Ultra");
            p2.setCategoryId(electronics.getId());
            p2.setDescription("AMOLED HD display, SpO2 monitoring, heart rate tracking, GPS, and 7-day battery backup.");
            p2.setBasePrice(new BigDecimal("2999.00"));
            p2.setMrp(new BigDecimal("4999.00"));
            p2.setStock(28);
            p2.setGstRate(electronics.getGstRate());
            p2.setStatus("ACTIVE");
            p2.setImageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80");
            productRepository.save(p2);

            Product p3 = new Product();
            p3.setVendorId(vendor.getId());
            p3.setName("Designer Leather Backpack");
            p3.setCategoryId(fashion.getId());
            p3.setDescription("Handcrafted genuine leather backpack with 15.6-inch laptop compartment and water-resistant finish.");
            p3.setBasePrice(new BigDecimal("1899.00"));
            p3.setMrp(new BigDecimal("2999.00"));
            p3.setStock(15);
            p3.setGstRate(fashion.getGstRate());
            p3.setStatus("ACTIVE");
            p3.setImageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80");
            productRepository.save(p3);

            Product p4 = new Product();
            p4.setVendorId(vendor.getId());
            p4.setName("Ergonomic Mesh Office Chair");
            p4.setCategoryId(home.getId());
            p4.setDescription("Adjustable lumbar support, 3D armrests, high-density foam seat with breathable mesh back.");
            p4.setBasePrice(new BigDecimal("6499.00"));
            p4.setMrp(new BigDecimal("9999.00"));
            p4.setStock(10);
            p4.setGstRate(home.getGstRate());
            p4.setStatus("PENDING_REVIEW"); // For Category Manager queue testing
            p4.setImageUrl("https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500&q=80");
            productRepository.save(p4);
        }
    }
}
