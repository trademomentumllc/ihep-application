import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import {
  insertUserSchema,
  insertResourceSchema,
  insertEventSchema,
  insertCommunityGroupSchema,
  insertDiscussionSchema,
  insertMessageSchema,
  insertNotificationSchema,
  insertEducationalContentSchema,
  insertAppointmentSchema
} from "@shared/schema";
import forumRoutes from "./routes/forum";
import settingsRoutes from "./routes/settings";
import smsRoutes from "./routes/sms";
import verificationRoutes from "./routes/verification";
import auditRoutes from "./routes/audit";
import complianceRoutes from "./routes/compliance";
import gamificationRoutes from "./routes/gamification";
import twilioHealthcareRoutes from "./routes/twilioHealthcare";
import wellnessTipsRoutes from "./routes/wellnessTips";
import neuralGovernanceRoutes from "./routes/neuralGovernance";
import healthcareAIRoutes from "./routes/healthcareAI";
import complianceOptimizerRoutes from "./routes/complianceOptimizer";
import MemoryStore from "memorystore";
import { getMockSmsLog } from './services/sms';
import bcrypt from 'bcrypt';
import { logAuthentication, logPhiAccess, logPhiModification, AuditEventType } from './services/auditLogger';

// Session store
const SessionStore = MemoryStore(session);

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Role-based access middleware
const hasRole = (role: string) => (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Type assertion to add role property
  const user = req.user as { role?: string };
  if (user.role !== role && user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a strong session secret if none is provided
  const getSessionSecret = () => {
    if (process.env.SESSION_SECRET) {
      return process.env.SESSION_SECRET;
    }
    
    // Generate a secure random string for the session secret
    const crypto = require('crypto');
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    
    console.log('Warning: SESSION_SECRET environment variable not set.');
    console.log('Using generated secure random secret. Note that sessions will not persist between server restarts.');
    
    return generatedSecret;
  };
  
  // Configure session with secure settings
  app.use(
    session({
      cookie: { 
        maxAge: 1800000, // 30 minutes - HIPAA compliant timeout
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevents client-side JS from reading the cookie
        sameSite: 'lax' // Provides some CSRF protection
      },
      store: new SessionStore({
        checkPeriod: 86400000, // 1 day
      }),
      resave: false,
      saveUninitialized: false,
      secret: getSessionSecret(),
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        // Secure password comparison using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes with HIPAA-compliant audit logging
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      if (!user) {
        // Log failed login attempt for HIPAA compliance
        await logAuthentication(
          null,
          "login_attempt",
          `Failed login attempt for username: ${req.body.username}`,
          ipAddress,
          false,
          { reason: info?.message || "Invalid credentials" }
        );
        
        return res.status(401).json({ 
          authenticated: false, 
          message: info?.message || "Invalid credentials" 
        });
      }
      
      // Log successful login for HIPAA compliance
      req.login(user, async (err) => {
        if (err) return next(err);
        
        await logAuthentication(
          user.id,
          "login",
          `User ${user.username} logged in successfully`,
          ipAddress,
          true
        );
        
        res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check for existing username
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check for existing email
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ 
          message: "Email address is already registered. Please use a different email or try logging in." 
        });
      }

      // Hash the password before storing it
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
      
      // Replace plain password with hashed password
      const userDataWithHashedPassword = {
        ...validatedData,
        password: hashedPassword
      };

      const newUser = await storage.createUser(userDataWithHashedPassword);
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      // Handle database constraint violations (email uniqueness)
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        return res.status(400).json({ 
          message: "Email address is already registered. Please use a different email or try logging in." 
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ authenticated: false });
    }
    
    const { password, ...userWithoutPassword } = req.user as any;
    res.json({ authenticated: true, user: userWithoutPassword });
  });

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const loggedInUser = req.user as any;
      
      // Users can only update their own profile unless they're an admin
      if (loggedInUser.id !== userId && loggedInUser.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Prevent role modification unless by admin
      if (req.body.role && loggedInUser.role !== "admin") {
        delete req.body.role;
      }
      
      // Handle password updates securely
      let updatedData = { ...req.body };
      if (updatedData.password) {
        // Hash the new password
        const saltRounds = 10;
        updatedData.password = await bcrypt.hash(updatedData.password, saltRounds);
      }
      
      const updatedUser = await storage.updateUser(userId, updatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.categories) {
        filters.categories = Array.isArray(req.query.categories) 
          ? req.query.categories as string[]
          : [req.query.categories as string];
      }
      
      if (req.query.distance) {
        filters.distance = req.query.distance as string;
      }
      
      if (req.query.availability) {
        filters.availability = Array.isArray(req.query.availability) 
          ? req.query.availability as string[]
          : [req.query.availability as string];
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const resources = await storage.getResources(filters);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(parseInt(req.params.id));
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource" });
    }
  });

  app.post("/api/resources", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const newResource = await storage.createResource(validatedData);
      res.status(201).json(newResource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.patch("/api/resources/:id", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const updatedResource = await storage.updateResource(resourceId, req.body);
      if (!updatedResource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json(updatedResource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  app.delete("/api/resources/:id", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const resourceId = parseInt(req.params.id);
      const success = await storage.deleteResource(resourceId);
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.isVirtual !== undefined) {
        filters.isVirtual = req.query.isVirtual === "true";
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(validatedData);
      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only allow updates by the host or admin
      const user = req.user as any;
      if (event.hostId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only allow deletion by the host or admin
      const user = req.user as any;
      if (event.hostId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/register", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const success = await storage.registerForEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ message: "Registration failed, event may be full" });
      }
      
      res.json({ message: "Registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.post("/api/events/:id/unregister", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const success = await storage.unregisterFromEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ message: "Unregistration failed" });
      }
      
      res.json({ message: "Unregistered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });

  // Community Group routes
  app.get("/api/community-groups", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.isPublic !== undefined) {
        filters.isPublic = req.query.isPublic === "true";
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const groups = await storage.getCommunityGroups(filters);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community groups" });
    }
  });

  app.get("/api/community-groups/:id", async (req, res) => {
    try {
      const group = await storage.getCommunityGroup(parseInt(req.params.id));
      if (!group) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community group" });
    }
  });

  app.post("/api/community-groups", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCommunityGroupSchema.parse(req.body);
      const newGroup = await storage.createCommunityGroup(validatedData);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create community group" });
    }
  });

  app.patch("/api/community-groups/:id", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const updatedGroup = await storage.updateCommunityGroup(groupId, req.body);
      if (!updatedGroup) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json(updatedGroup);
    } catch (error) {
      res.status(500).json({ message: "Failed to update community group" });
    }
  });

  app.delete("/api/community-groups/:id", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const success = await storage.deleteCommunityGroup(groupId);
      if (!success) {
        return res.status(404).json({ message: "Community group not found" });
      }
      res.json({ message: "Community group deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete community group" });
    }
  });

  app.post("/api/community-groups/:id/join", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const success = await storage.joinCommunityGroup(groupId, userId);
      if (!success) {
        return res.status(400).json({ message: "Failed to join group" });
      }
      
      res.json({ message: "Joined group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join community group" });
    }
  });

  app.post("/api/community-groups/:id/leave", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      
      const success = await storage.leaveCommunityGroup(groupId, userId);
      if (!success) {
        return res.status(400).json({ message: "Failed to leave group" });
      }
      
      res.json({ message: "Left group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave community group" });
    }
  });

  // Discussion routes
  app.get("/api/discussions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.groupId) {
        filters.groupId = parseInt(req.query.groupId as string);
      }
      
      if (req.query.authorId) {
        filters.authorId = parseInt(req.query.authorId as string);
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const discussions = await storage.getDiscussions(filters);
      res.json(discussions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  app.get("/api/discussions/:id", async (req, res) => {
    try {
      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });

  app.post("/api/discussions", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertDiscussionSchema.parse(req.body);
      validatedData.authorId = (req.user as any).id;
      
      const newDiscussion = await storage.createDiscussion(validatedData);
      res.status(201).json(newDiscussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  app.patch("/api/discussions/:id", isAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      // Only allow updates by the author or admin
      const user = req.user as any;
      if (discussion.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedDiscussion = await storage.updateDiscussion(discussionId, req.body);
      res.json(updatedDiscussion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update discussion" });
    }
  });

  app.delete("/api/discussions/:id", isAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      // Only allow deletion by the author or admin
      const user = req.user as any;
      if (discussion.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteDiscussion(discussionId);
      if (!success) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete discussion" });
    }
  });

  app.post("/api/discussions/:id/like", isAuthenticated, async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const success = await storage.likeDiscussion(discussionId);
      if (!success) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json({ message: "Discussion liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like discussion" });
    }
  });

  // Message routes
  app.get("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const filters: any = {};
      
      if (req.query.sender === "me") {
        filters.senderId = userId;
      } else if (req.query.sender) {
        filters.senderId = parseInt(req.query.sender as string);
      }
      
      if (req.query.recipient === "me") {
        filters.recipientId = userId;
      } else if (req.query.recipient) {
        filters.recipientId = parseInt(req.query.recipient as string);
      }
      
      if (req.query.isRead !== undefined) {
        filters.isRead = req.query.isRead === "true";
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const messages = await storage.getMessages(filters);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow the sender or recipient to view the message
      const userId = (req.user as any).id;
      if (message.senderId !== userId && message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Mark as read if you're the recipient viewing it
      if (message.recipientId === userId && !message.isRead) {
        await storage.markMessageAsRead(messageId);
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      validatedData.senderId = (req.user as any).id;
      
      const newMessage = await storage.createMessage(validatedData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow the recipient to mark as read
      const userId = (req.user as any).id;
      if (message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.markMessageAsRead(messageId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only allow the sender or recipient to delete the message
      const userId = (req.user as any).id;
      if (message.senderId !== userId && message.recipientId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteMessage(messageId);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const isRead = req.query.isRead === "true" ? true : (req.query.isRead === "false" ? false : undefined);
      
      const notifications = await storage.getNotifications(userId, isRead);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.getNotification(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Only allow the recipient to mark as read
      const userId = (req.user as any).id;
      if (notification.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.markNotificationAsRead(notificationId);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      // Default filter settings
      const filters: any = {};
      
      // Apply user-specific filters based on role
      if (userRole === "patient") {
        filters.patientId = userId;
      } else if (userRole === "provider") {
        filters.providerId = userId;
      }
      
      // Apply additional query filters
      if (req.query.patientId) {
        filters.patientId = parseInt(req.query.patientId as string);
      }
      
      if (req.query.providerId) {
        filters.providerId = parseInt(req.query.providerId as string);
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      // Log the PHI access for HIPAA compliance
      await logPhiAccess(
        userId,
        "appointments",
        filters.patientId ? `patient_${filters.patientId}` : "multiple",
        "view",
        `User ${userId} (${userRole}) accessed appointment records${filters.patientId ? ` for patient ${filters.patientId}` : ''}`,
        ipAddress,
        true,
        { filters }
      );
      
      const appointments = await storage.getAppointments(filters);
      res.json(appointments);
    } catch (error: unknown) {
      // Log failed access attempt
      try {
        const userId = (req.user as any)?.id;
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await logPhiAccess(
          userId || 0,
          "appointments",
          "error",
          "view",
          `Failed to access appointment records: ${errorMessage}`,
          ipAddress,
          false,
          { error: errorMessage }
        );
      } catch (logError) {
        console.error("Failed to log PHI access error:", logError);
      }
      
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const user = req.user as any;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        // Log attempted access to non-existent appointment for HIPAA compliance
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `User ${userId} (${userRole}) attempted to access non-existent appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Appointment not found" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if the user has access to this appointment
      if (userRole !== "admin" && 
          appointment.patientId !== userId && 
          appointment.providerId !== userId) {
        
        // Log unauthorized access attempt for HIPAA compliance
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `User ${userId} (${userRole}) attempted unauthorized access to appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Forbidden", appointmentDetails: { patientId: appointment.patientId, providerId: appointment.providerId } }
        );
        
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Log successful PHI access for HIPAA compliance
      await logPhiAccess(
        userId,
        "appointment",
        appointmentId.toString(),
        "view",
        `User ${userId} (${userRole}) viewed appointment ${appointmentId}`,
        ipAddress,
        true,
        { 
          accessReason: userRole === "admin" ? "administrative" : 
                       (appointment.patientId === userId ? "patient_self_access" : "provider_access")
        }
      );
      
      res.json(appointment);
    } catch (error: unknown) {
      // Log error for HIPAA compliance
      try {
        const user = req.user as any;
        const userId = user?.id || 0;
        const userRole = user?.role || "unknown";
        const appointmentId = parseInt(req.params.id);
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        await logPhiAccess(
          userId,
          "appointment",
          appointmentId.toString(),
          "view",
          `Error accessing appointment ${appointmentId}: ${errorMessage}`,
          ipAddress,
          false,
          { error: errorMessage, userRole }
        );
      } catch (logError) {
        console.error("Failed to log PHI access error:", logError);
      }
      
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const user = req.user as any;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      // If the user is a patient, make sure they're creating an appointment for themselves
      if (userRole === "patient" && validatedData.patientId !== userId) {
        // Log unauthorized attempt for HIPAA compliance
        await logPhiModification(
          userId,
          "appointment",
          "new",
          "create",
          `Patient ${userId} attempted to create appointment for another patient (${validatedData.patientId})`,
          ipAddress,
          false,
          { error: "Unauthorized", requestData: { ...validatedData, patientId: "[REDACTED]" } }
        );
        return res.status(403).json({ message: "You can only create appointments for yourself" });
      }
      
      const appointment = await storage.createAppointment(validatedData);
      
      // Log successful creation for HIPAA compliance
      await logPhiModification(
        userId,
        "appointment",
        appointment.id.toString(),
        "create",
        `User ${userId} (${userRole}) created appointment ${appointment.id}`,
        ipAddress,
        true,
        { 
          appointmentDetails: {
            patientId: appointment.patientId,
            providerId: appointment.providerId,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            type: appointment.type
          }
        }
      );
      
      res.status(201).json(appointment);
    } catch (error: any) {
      // Log error for HIPAA compliance
      try {
        const user = req.user as any;
        const userId = user.id;
        const userRole = user.role;
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        
        await logPhiModification(
          userId,
          "appointment",
          "new",
          "create",
          `Error creating appointment: ${error.message || "Unknown error"}`,
          ipAddress,
          false,
          { 
            errorType: error instanceof z.ZodError ? "validation_error" : "server_error",
            requestBody: { ...req.body, patientData: "[REDACTED]" }
          }
        );
      } catch (logError) {
        console.error("Failed to log PHI modification error:", logError);
      }
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const user = req.user as any;
      const userId = user.id;
      const userRole = user.role;
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
      
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        // Log attempted update of non-existent appointment for HIPAA compliance
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `User ${userId} (${userRole}) attempted to update non-existent appointment ${appointmentId}`,
          ipAddress,
          false,
          { error: "Appointment not found" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if the user has permission to update this appointment
      if (userRole !== "admin" && 
          appointment.patientId !== userId && 
          appointment.providerId !== userId) {
        // Log unauthorized update attempt for HIPAA compliance
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `User ${userId} (${userRole}) attempted unauthorized update of appointment ${appointmentId}`,
          ipAddress,
          false,
          { 
            error: "Forbidden", 
            appointmentDetails: { 
              patientId: appointment.patientId,
              providerId: appointment.providerId
            }
          }
        );
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create a before snapshot for audit purposes
      const beforeSnapshot = { ...appointment };
      
      // Update the appointment
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      
      if (!updatedAppointment) {
        // This should not happen normally since we checked existence above
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `Failed to update appointment ${appointmentId} after permission check`,
          ipAddress,
          false,
          { error: "Appointment not found after initial check" }
        );
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Log successful update for HIPAA compliance with change tracking
      await logPhiModification(
        userId,
        "appointment",
        appointmentId.toString(),
        "update",
        `User ${userId} (${userRole}) updated appointment ${appointmentId}`,
        ipAddress,
        true,
        { 
          changes: {
            before: {
              status: beforeSnapshot.status,
              startTime: beforeSnapshot.startTime,
              endTime: beforeSnapshot.endTime,
              notes: beforeSnapshot.notes ? "[PRESENT]" : "[NOT PRESENT]",
              type: beforeSnapshot.type
            },
            after: {
              status: updatedAppointment.status,
              startTime: updatedAppointment.startTime,
              endTime: updatedAppointment.endTime,
              notes: updatedAppointment.notes ? "[PRESENT]" : "[NOT PRESENT]",
              type: updatedAppointment.type
            }
          }
        }
      );
      
      res.json(updatedAppointment);
    } catch (error: any) {
      // Log error for HIPAA compliance
      try {
        const user = req.user as any;
        const userId = user.id;
        const userRole = user.role;
        const appointmentId = parseInt(req.params.id);
        const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
        
        await logPhiModification(
          userId,
          "appointment",
          appointmentId.toString(),
          "update",
          `Error updating appointment ${appointmentId}: ${error.message || "Unknown error"}`,
          ipAddress,
          false,
          { 
            error: error.message || "Unknown error",
            requestBody: { ...req.body, patientData: "[REDACTED]" }
          }
        );
      } catch (logError) {
        console.error("Failed to log PHI modification error:", logError);
      }
      
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.post("/api/appointments/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if the user has permission to cancel this appointment
      const user = req.user as any;
      if (user.role !== "admin" && 
          appointment.patientId !== user.id && 
          appointment.providerId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.cancelAppointment(appointmentId);
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  // Educational Content routes
  app.get("/api/educational-content", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.tags) {
        filters.tags = Array.isArray(req.query.tags) 
          ? req.query.tags as string[]
          : [req.query.tags as string];
      }
      
      if (req.query.authorId) {
        filters.authorId = parseInt(req.query.authorId as string);
      }
      
      if (req.query.featured !== undefined) {
        filters.featured = req.query.featured === "true";
      }
      
      if (req.query.search) {
        filters.search = req.query.search as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const contents = await storage.getEducationalContents(filters);
      res.json(contents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });

  app.get("/api/educational-content/:id", async (req, res) => {
    try {
      const content = await storage.getEducationalContent(parseInt(req.params.id));
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch educational content" });
    }
  });

  app.post("/api/educational-content", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const validatedData = insertEducationalContentSchema.parse(req.body);
      validatedData.authorId = (req.user as any).id;
      
      const newContent = await storage.createEducationalContent(validatedData);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create educational content" });
    }
  });

  app.patch("/api/educational-content/:id", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getEducationalContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      
      // Only allow updates by the author or admin
      const user = req.user as any;
      if (content.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedContent = await storage.updateEducationalContent(contentId, req.body);
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to update educational content" });
    }
  });

  app.delete("/api/educational-content/:id", isAuthenticated, hasRole("provider"), async (req, res) => {
    try {
      const contentId = parseInt(req.params.id);
      const content = await storage.getEducationalContent(contentId);
      
      if (!content) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      
      // Only allow deletion by the author or admin
      const user = req.user as any;
      if (content.authorId !== user.id && user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.deleteEducationalContent(contentId);
      if (!success) {
        return res.status(404).json({ message: "Educational content not found" });
      }
      
      res.json({ message: "Educational content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete educational content" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      const filters: any = {};
      
      // Patients can only see their own appointments
      if (userRole === "patient") {
        filters.patientId = userId;
      } 
      // Providers can filter by patient or see all their appointments
      else if (userRole === "provider") {
        filters.providerId = userId;
        if (req.query.patientId) {
          filters.patientId = parseInt(req.query.patientId as string);
        }
      }
      // Admin can see all appointments or filter by patient/provider
      else if (userRole === "admin") {
        if (req.query.patientId) {
          filters.patientId = parseInt(req.query.patientId as string);
        }
        if (req.query.providerId) {
          filters.providerId = parseInt(req.query.providerId as string);
        }
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      
      if (req.query.page) {
        filters.page = parseInt(req.query.page as string);
        filters.limit = parseInt(req.query.limit as string) || 10;
      }
      
      const appointments = await storage.getAppointments(filters);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check authorization
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      // Patients can only create appointments for themselves
      if (userRole === "patient") {
        validatedData.patientId = userId;
      }
      
      // Providers can create appointments for any patient with themselves as provider
      else if (userRole === "provider") {
        validatedData.providerId = userId;
      }
      
      const newAppointment = await storage.createAppointment(validatedData);
      
      // Create a notification for the patient
      await storage.createNotification({
        userId: validatedData.patientId,
        title: "Appointment Scheduled",
        message: `New appointment scheduled on ${new Date(validatedData.startTime).toLocaleDateString()} at ${new Date(validatedData.startTime).toLocaleTimeString()}`,
        type: "appointment",
        relatedId: newAppointment.id,
        relatedType: "appointment"
      });
      
      // Create a notification for the provider
      await storage.createNotification({
        userId: validatedData.providerId,
        title: "New Appointment",
        message: `New appointment scheduled on ${new Date(validatedData.startTime).toLocaleDateString()} at ${new Date(validatedData.startTime).toLocaleTimeString()}`,
        type: "appointment",
        relatedId: newAppointment.id,
        relatedType: "appointment"
      });
      
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check authorization
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      // Patients can only reschedule, not modify other details
      if (userRole === "patient" && appointment.patientId === userId) {
        if (req.body.status || req.body.notes || req.body.type) {
          return res.status(403).json({ message: "Patients can only reschedule appointments" });
        }
      }
      // Providers can update their own appointments
      else if (userRole === "provider" && appointment.providerId === userId) {
        // Allow all updates
      }
      // Admin can update any appointment
      else if (userRole === "admin") {
        // Allow all updates
      }
      else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
      
      // Create notifications about the update
      if (req.body.startTime || req.body.status) {
        const notificationMessage = req.body.startTime
          ? `Appointment rescheduled to ${new Date(req.body.startTime).toLocaleDateString()} at ${new Date(req.body.startTime).toLocaleTimeString()}`
          : `Appointment ${req.body.status}`;
        
        // Notify the patient
        await storage.createNotification({
          userId: appointment.patientId,
          title: "Appointment Updated",
          message: notificationMessage,
          type: "appointment_update",
          relatedId: appointment.id,
          relatedType: "appointment"
        });
        
        // Notify the provider
        await storage.createNotification({
          userId: appointment.providerId,
          title: "Appointment Updated",
          message: notificationMessage,
          type: "appointment_update",
          relatedId: appointment.id,
          relatedType: "appointment"
        });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.post("/api/appointments/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await storage.getAppointment(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check authorization
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      if (userRole !== "admin" && appointment.patientId !== userId && appointment.providerId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const success = await storage.cancelAppointment(appointmentId);
      if (!success) {
        return res.status(400).json({ message: "Failed to cancel appointment" });
      }
      
      // Create cancellation notifications
      const cancellationReason = req.body.reason || "No reason provided";
      const cancellationMessage = `Appointment on ${new Date(appointment.startTime).toLocaleDateString()} at ${new Date(appointment.startTime).toLocaleTimeString()} was cancelled. Reason: ${cancellationReason}`;
      
      // Notify the patient
      await storage.createNotification({
        userId: appointment.patientId,
        title: "Appointment Cancelled",
        message: cancellationMessage,
        type: "appointment_cancelled",
        relatedId: appointment.id,
        relatedType: "appointment"
      });
      
      // Notify the provider
      await storage.createNotification({
        userId: appointment.providerId,
        title: "Appointment Cancelled",
        message: cancellationMessage,
        type: "appointment_cancelled",
        relatedId: appointment.id,
        relatedType: "appointment"
      });
      
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  // RSS Feed admin route - allows manual refresh of health article resources
  app.post("/api/admin/refresh-feeds", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const { refreshAllFeeds } = await import("./services/rssFeed");
      const count = await refreshAllFeeds();
      res.json({ message: `Successfully refreshed ${count} resources from RSS feeds` });
    } catch (error) {
      res.status(500).json({ message: `Failed to refresh feeds: ${(error as Error).message}` });
    }
  });

  // Database optimization admin route - removes duplicates and optimizes performance
  app.post("/api/admin/optimize-database", isAuthenticated, hasRole("admin"), async (req, res) => {
    try {
      const result = await storage.optimizeDatabase();
      res.json({ 
        message: `Database optimization completed. Removed ${result.duplicatesRemoved} duplicate users.`,
        details: result
      });
    } catch (error) {
      res.status(500).json({ message: `Database optimization failed: ${(error as Error).message}` });
    }
  });

  // Mount forum routes
  app.use("/api/forum", forumRoutes);
  
  // Mount settings routes
  app.use("/api/settings", settingsRoutes);
  
  // Mount SMS routes
  app.use("/api/sms", smsRoutes);
  
  // Mount phone verification routes
  app.use("/api/verification", verificationRoutes);
  
  // Mount HIPAA compliance audit logging routes (admin access only)
  app.use("/api/audit", auditRoutes);
  
  // Mount state-specific compliance routes (Florida and New York regulations)
  app.use("/api/compliance", complianceRoutes);
  
  // Mount gamification routes for health engagement rewards program
  app.use("/api/gamification", gamificationRoutes);
  
  // Mount Twilio healthcare services routes
  app.use("/api/twilio-healthcare", twilioHealthcareRoutes);
  
  // Mount wellness tips routes
  app.use("/api/wellness-tips", wellnessTipsRoutes);
  
  // Mount neural governance intelligence routes
  app.use("/api/neural-governance", neuralGovernanceRoutes);
  
  // Mount healthcare AI assistant routes
  app.use("/api/healthcare-ai", healthcareAIRoutes);
  
  // Mount compliance optimizer routes
  app.use("/api/compliance-optimizer", complianceOptimizerRoutes);
  
  // Using SMS mock functionality
  
  // SMS testing routes for development
  app.get("/api/sms/logs", isAuthenticated, async (req, res) => {
    try {
      const smsLogs = getMockSmsLog();
      res.json({ logs: smsLogs });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve SMS logs" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
