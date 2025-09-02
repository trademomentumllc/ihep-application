import { users, type User, type InsertUser } from "@shared/schema";
import { resources, type Resource, type InsertResource } from "@shared/schema";
import { events, type Event, type InsertEvent } from "@shared/schema";
import { communityGroups, type CommunityGroup, type InsertCommunityGroup } from "@shared/schema";
import { discussions, type Discussion, type InsertDiscussion } from "@shared/schema";
import { messages, type Message, type InsertMessage } from "@shared/schema";
import { notifications, type Notification, type InsertNotification } from "@shared/schema";
import { educationalContent, type EducationalContent, type InsertEducationalContent } from "@shared/schema";
import { appointments, type Appointment, type InsertAppointment } from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, asc, or, inArray, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  optimizeDatabase(): Promise<{ duplicatesRemoved: number; optimizations: string[] }>;
  
  // Resources
  getResource(id: number): Promise<Resource | undefined>;
  getResources(filters?: {
    categories?: string[];
    distance?: string;
    availability?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Events
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    isVirtual?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  registerForEvent(eventId: number, userId: number): Promise<boolean>;
  unregisterFromEvent(eventId: number, userId: number): Promise<boolean>;
  
  // Community Groups
  getCommunityGroup(id: number): Promise<CommunityGroup | undefined>;
  getCommunityGroups(filters?: {
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CommunityGroup[]>;
  createCommunityGroup(group: InsertCommunityGroup): Promise<CommunityGroup>;
  updateCommunityGroup(id: number, groupData: Partial<CommunityGroup>): Promise<CommunityGroup | undefined>;
  deleteCommunityGroup(id: number): Promise<boolean>;
  joinCommunityGroup(groupId: number, userId: number): Promise<boolean>;
  leaveCommunityGroup(groupId: number, userId: number): Promise<boolean>;
  
  // Discussions
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getDiscussions(filters?: {
    groupId?: number;
    authorId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  updateDiscussion(id: number, discussionData: Partial<Discussion>): Promise<Discussion | undefined>;
  deleteDiscussion(id: number): Promise<boolean>;
  likeDiscussion(id: number): Promise<boolean>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessages(filters: {
    senderId?: number;
    recipientId?: number;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotifications(userId: number, isRead?: boolean): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Educational Content
  getEducationalContent(id: number): Promise<EducationalContent | undefined>;
  getEducationalContents(filters?: {
    category?: string;
    tags?: string[];
    authorId?: number;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EducationalContent[]>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;
  updateEducationalContent(id: number, contentData: Partial<EducationalContent>): Promise<EducationalContent | undefined>;
  deleteEducationalContent(id: number): Promise<boolean>;
  
  // Appointments
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointments(filters: {
    patientId?: number;
    providerId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  cancelAppointment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Resources
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async getResources(filters?: {
    categories?: string[];
    distance?: string;
    availability?: string[];
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Resource[]> {
    let query = db.select().from(resources);

    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        query = query.where(inArray(resources.category, filters.categories));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(resources.name, searchTerm),
            like(resources.description, searchTerm),
            like(resources.category, searchTerm)
          )
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);
    }

    return await query;
  }

  async createResource(resourceData: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(resourceData).returning();
    return resource;
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const [updatedResource] = await db
      .update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning({ id: resources.id });
    return result.length > 0;
  }

  // Events
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEvents(filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    isVirtual?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Event[]> {
    let query = db.select().from(events);

    if (filters) {
      if (filters.startDate) {
        query = query.where(gte(events.startTime, filters.startDate));
      }

      if (filters.endDate) {
        query = query.where(lte(events.endTime, filters.endDate));
      }

      if (filters.category) {
        query = query.where(eq(events.category, filters.category));
      }

      if (filters.isVirtual !== undefined) {
        query = query.where(eq(events.isVirtual, filters.isVirtual));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(events.title, searchTerm),
            like(events.description, searchTerm)
          )
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);
    }

    // Order by start time
    query = query.orderBy(asc(events.startTime));

    return await query;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
    return result.length > 0;
  }

  async registerForEvent(eventId: number, userId: number): Promise<boolean> {
    const event = await this.getEvent(eventId);
    if (!event) return false;

    let registeredUsers = event.registeredUsers || [];
    if (!registeredUsers.includes(userId)) {
      registeredUsers.push(userId);
      const updatedEvent = await this.updateEvent(eventId, { registeredUsers });
      return !!updatedEvent;
    }
    return true;
  }

  async unregisterFromEvent(eventId: number, userId: number): Promise<boolean> {
    const event = await this.getEvent(eventId);
    if (!event || !event.registeredUsers) return false;

    const registeredUsers = event.registeredUsers.filter(id => id !== userId);
    const updatedEvent = await this.updateEvent(eventId, { registeredUsers });
    return !!updatedEvent;
  }

  // Community Groups
  async getCommunityGroup(id: number): Promise<CommunityGroup | undefined> {
    const [group] = await db.select().from(communityGroups).where(eq(communityGroups.id, id));
    return group;
  }

  async getCommunityGroups(filters?: {
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CommunityGroup[]> {
    let query = db.select().from(communityGroups);

    if (filters) {
      if (filters.isPublic !== undefined) {
        query = query.where(eq(communityGroups.isPublic, filters.isPublic));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(communityGroups.name, searchTerm),
            like(communityGroups.description, searchTerm)
          )
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);
    }

    // Order by last active
    query = query.orderBy(desc(communityGroups.lastActive));

    return await query;
  }

  async createCommunityGroup(groupData: InsertCommunityGroup): Promise<CommunityGroup> {
    const now = new Date();
    const data = {
      ...groupData,
      createdAt: now,
      lastActive: now,
      memberCount: 1, // Creator is first member
      members: [1] // Assuming creator ID is 1 for now
    };
    
    const [group] = await db.insert(communityGroups).values(data).returning();
    return group;
  }

  async updateCommunityGroup(id: number, groupData: Partial<CommunityGroup>): Promise<CommunityGroup | undefined> {
    const [updatedGroup] = await db
      .update(communityGroups)
      .set(groupData)
      .where(eq(communityGroups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteCommunityGroup(id: number): Promise<boolean> {
    const result = await db.delete(communityGroups).where(eq(communityGroups.id, id)).returning({ id: communityGroups.id });
    return result.length > 0;
  }

  async joinCommunityGroup(groupId: number, userId: number): Promise<boolean> {
    const group = await this.getCommunityGroup(groupId);
    if (!group) return false;

    let members = group.members || [];
    if (!members.includes(userId)) {
      members.push(userId);
      const memberCount = (group.memberCount || 0) + 1;
      const updatedGroup = await this.updateCommunityGroup(groupId, { 
        members, 
        memberCount,
        lastActive: new Date()
      });
      return !!updatedGroup;
    }
    return true;
  }

  async leaveCommunityGroup(groupId: number, userId: number): Promise<boolean> {
    const group = await this.getCommunityGroup(groupId);
    if (!group || !group.members) return false;

    const members = group.members.filter(id => id !== userId);
    const memberCount = Math.max(0, (group.memberCount || 1) - 1);
    const updatedGroup = await this.updateCommunityGroup(groupId, { 
      members, 
      memberCount,
      lastActive: new Date()
    });
    return !!updatedGroup;
  }

  // Discussions
  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async getDiscussions(filters?: {
    groupId?: number;
    authorId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Discussion[]> {
    let query = db.select().from(discussions);

    if (filters) {
      if (filters.groupId !== undefined) {
        query = query.where(eq(discussions.groupId, filters.groupId));
      }

      if (filters.authorId !== undefined) {
        query = query.where(eq(discussions.authorId, filters.authorId));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(discussions.title, searchTerm),
            like(discussions.content, searchTerm)
          )
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);
    }

    // Order by created date (newest first)
    query = query.orderBy(desc(discussions.createdAt));

    return await query;
  }

  async createDiscussion(discussionData: InsertDiscussion): Promise<Discussion> {
    const now = new Date();
    const data = {
      ...discussionData,
      createdAt: now,
      updatedAt: now,
      replyCount: 0,
      likes: 0
    };
    
    const [discussion] = await db.insert(discussions).values(data).returning();
    return discussion;
  }

  async updateDiscussion(id: number, discussionData: Partial<Discussion>): Promise<Discussion | undefined> {
    const [updatedDiscussion] = await db
      .update(discussions)
      .set({
        ...discussionData,
        updatedAt: new Date()
      })
      .where(eq(discussions.id, id))
      .returning();
    return updatedDiscussion;
  }

  async deleteDiscussion(id: number): Promise<boolean> {
    const result = await db.delete(discussions).where(eq(discussions.id, id)).returning({ id: discussions.id });
    return result.length > 0;
  }

  async likeDiscussion(id: number): Promise<boolean> {
    const discussion = await this.getDiscussion(id);
    if (!discussion) return false;

    const likes = (discussion.likes || 0) + 1;
    const updatedDiscussion = await this.updateDiscussion(id, { likes });
    return !!updatedDiscussion;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async getMessages(filters: {
    senderId?: number;
    recipientId?: number;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Message[]> {
    let query = db.select().from(messages);

    if (filters.senderId !== undefined) {
      query = query.where(eq(messages.senderId, filters.senderId));
    }

    if (filters.recipientId !== undefined) {
      query = query.where(eq(messages.recipientId, filters.recipientId));
    }

    if (filters.isRead !== undefined) {
      query = query.where(eq(messages.isRead, filters.isRead));
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);

    // Order by created date (newest first)
    query = query.orderBy(desc(messages.createdAt));

    return await query;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const data = {
      ...messageData,
      createdAt: new Date(),
      isRead: false
    };
    
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return !!updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id)).returning({ id: messages.id });
    return result.length > 0;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getNotifications(userId: number, isRead?: boolean): Promise<Notification[]> {
    let query = db.select().from(notifications).where(eq(notifications.userId, userId));

    if (isRead !== undefined) {
      query = query.where(eq(notifications.isRead, isRead));
    }

    // Order by created date (newest first)
    query = query.orderBy(desc(notifications.createdAt));

    return await query;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const data = {
      ...notificationData,
      createdAt: new Date(),
      isRead: false
    };
    
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return !!updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id)).returning({ id: notifications.id });
    return result.length > 0;
  }

  // Educational Content
  async getEducationalContent(id: number): Promise<EducationalContent | undefined> {
    const [content] = await db.select().from(educationalContent).where(eq(educationalContent.id, id));
    return content;
  }

  async getEducationalContents(filters?: {
    category?: string;
    tags?: string[];
    authorId?: number;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EducationalContent[]> {
    let query = db.select().from(educationalContent);

    if (filters) {
      if (filters.category) {
        query = query.where(eq(educationalContent.category, filters.category));
      }

      if (filters.authorId !== undefined) {
        query = query.where(eq(educationalContent.authorId, filters.authorId));
      }

      if (filters.featured !== undefined) {
        query = query.where(eq(educationalContent.featured, filters.featured));
      }

      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.where(
          or(
            like(educationalContent.title, searchTerm),
            like(educationalContent.content, searchTerm),
            like(educationalContent.category, searchTerm)
          )
        );
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const offset = (page - 1) * limit;
      
      query = query.limit(limit).offset(offset);
    }

    // Order by published date (newest first)
    query = query.orderBy(desc(educationalContent.publishedDate));

    return await query;
  }

  async createEducationalContent(contentData: InsertEducationalContent): Promise<EducationalContent> {
    const now = new Date();
    const data = {
      ...contentData,
      publishedDate: now,
      lastUpdated: now
    };
    
    const [content] = await db.insert(educationalContent).values(data).returning();
    return content;
  }

  async updateEducationalContent(id: number, contentData: Partial<EducationalContent>): Promise<EducationalContent | undefined> {
    const [updatedContent] = await db
      .update(educationalContent)
      .set({
        ...contentData,
        lastUpdated: new Date()
      })
      .where(eq(educationalContent.id, id))
      .returning();
    return updatedContent;
  }

  async deleteEducationalContent(id: number): Promise<boolean> {
    const result = await db.delete(educationalContent).where(eq(educationalContent.id, id)).returning({ id: educationalContent.id });
    return result.length > 0;
  }

  // Appointments
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointments(filters: {
    patientId?: number;
    providerId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Appointment[]> {
    let query = db.select().from(appointments);

    if (filters.patientId !== undefined) {
      query = query.where(eq(appointments.patientId, filters.patientId));
    }

    if (filters.providerId !== undefined) {
      query = query.where(eq(appointments.providerId, filters.providerId));
    }

    if (filters.startDate) {
      query = query.where(gte(appointments.startTime, filters.startDate));
    }

    if (filters.endDate) {
      query = query.where(lte(appointments.endTime, filters.endDate));
    }

    if (filters.status) {
      query = query.where(eq(appointments.status, filters.status));
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);

    // Order by start time
    query = query.orderBy(asc(appointments.startTime));

    return await query;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const data = {
      ...appointmentData,
      reminderSent: false
    };
    
    const [appointment] = await db.insert(appointments).values(data).returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async cancelAppointment(id: number): Promise<boolean> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ status: 'cancelled' })
      .where(eq(appointments.id, id))
      .returning();
    return !!updatedAppointment;
  }

  // Database optimization
  async optimizeDatabase(): Promise<{ duplicatesRemoved: number; optimizations: string[] }> {
    const optimizations: string[] = [];
    let duplicatesRemoved = 0;

    try {
      // Find and remove duplicate users by email
      const allUsers = await db.select().from(users);
      const emailMap = new Map<string, User[]>();
      
      // Group users by email
      for (const user of allUsers) {
        if (!emailMap.has(user.email)) {
          emailMap.set(user.email, []);
        }
        emailMap.get(user.email)!.push(user);
      }

      // Remove duplicates (keep the oldest user)
      for (const [email, userList] of emailMap) {
        if (userList.length > 1) {
          // Sort by creation date (oldest first)
          userList.sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
          
          // Remove all but the first (oldest) user
          for (let i = 1; i < userList.length; i++) {
            await db.delete(users).where(eq(users.id, userList[i].id));
            duplicatesRemoved++;
            optimizations.push(`Removed duplicate user: ${email} (ID: ${userList[i].id})`);
          }
        }
      }

      optimizations.push('Completed duplicate user cleanup');
      return { duplicatesRemoved, optimizations };
    } catch (error) {
      console.error('Database optimization error:', error);
      return { duplicatesRemoved: 0, optimizations: ['Error during optimization: ' + (error as Error).message] };
    }
  }
}

export const storage = new DatabaseStorage();