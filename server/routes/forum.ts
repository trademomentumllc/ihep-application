import { Request, Response, Router } from "express";
import { db } from "../db";
import { eq, desc, and, like, or, count } from "drizzle-orm";
import { 
  forumCategories, 
  forumPosts, 
  forumComments,
  insertForumCategorySchema,
  insertForumPostSchema,
  insertForumCommentSchema
} from "@shared/schema";
import { 
  moderateForumPost, 
  moderateForumComment,
  analyzeMedicalRelevance
} from "../services/aiModeration";

const router = Router();

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && (req.user as any).role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied" });
};

// Get all forum categories
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await db.select().from(forumCategories).orderBy(forumCategories.displayOrder);
    return res.json(categories);
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return res.status(500).json({ error: "Failed to fetch forum categories" });
  }
});

// Get single forum category by id or slug
router.get("/categories/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a number (id) or string (slug)
    const isId = !isNaN(Number(identifier));
    
    let category;
    if (isId) {
      [category] = await db
        .select()
        .from(forumCategories)
        .where(eq(forumCategories.id, parseInt(identifier)));
    } else {
      [category] = await db
        .select()
        .from(forumCategories)
        .where(eq(forumCategories.slug, identifier));
    }
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    return res.json(category);
  } catch (error) {
    console.error("Error fetching forum category:", error);
    return res.status(500).json({ error: "Failed to fetch forum category" });
  }
});

// Create new forum category (admin only)
router.post("/categories", isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = insertForumCategorySchema.parse(req.body);
    
    // Generate slug if not provided
    if (!validatedData.slug) {
      validatedData.slug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    
    const [newCategory] = await db
      .insert(forumCategories)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating forum category:", error);
    return res.status(400).json({ error: error.message || "Failed to create forum category" });
  }
});

// Update forum category (admin only)
router.patch("/categories/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedCategory] = await db
      .update(forumCategories)
      .set(updates)
      .where(eq(forumCategories.id, parseInt(id)))
      .returning();
    
    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    return res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating forum category:", error);
    return res.status(400).json({ error: error.message || "Failed to update forum category" });
  }
});

// Delete forum category (admin only)
router.delete("/categories/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if category exists
    const [category] = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.id, parseInt(id)));
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    // Delete the category
    await db
      .delete(forumCategories)
      .where(eq(forumCategories.id, parseInt(id)));
    
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum category:", error);
    return res.status(500).json({ error: "Failed to delete forum category" });
  }
});

// Get forum posts by category
router.get("/categories/:categoryId/posts", async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;
    
    const posts = await db
      .select()
      .from(forumPosts)
      .where(and(
        eq(forumPosts.categoryId, parseInt(categoryId)),
        eq(forumPosts.moderationStatus, "approved")
      ))
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
      .limit(limitNumber)
      .offset(offset);
    
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(forumPosts)
      .where(and(
        eq(forumPosts.categoryId, parseInt(categoryId)),
        eq(forumPosts.moderationStatus, "approved")
      ));
    
    return res.json({
      posts,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});

// Get all forum posts with filtering and search
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categoryId, 
      search,
      isPinned,
      isFeatured 
    } = req.query;
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;
    
    let conditions = [];
    
    // Only show approved posts to users
    conditions.push(eq(forumPosts.moderationStatus, "approved"));
    
    // Add filters if provided
    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, parseInt(categoryId as string)));
    }
    
    if (isPinned === "true") {
      conditions.push(eq(forumPosts.isPinned, true));
    }
    
    if (isFeatured === "true") {
      conditions.push(eq(forumPosts.isFeatured, true));
    }
    
    // Add search if provided
    if (search) {
      conditions.push(
        or(
          like(forumPosts.title, `%${search}%`),
          like(forumPosts.content, `%${search}%`)
        )
      );
    }
    
    const whereCondition = conditions.length > 0 
      ? and(...conditions) 
      : undefined;
    
    const posts = whereCondition
      ? await db
          .select()
          .from(forumPosts)
          .where(whereCondition)
          .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
          .limit(limitNumber)
          .offset(offset)
      : await db
          .select()
          .from(forumPosts)
          .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
          .limit(limitNumber)
          .offset(offset);
    
    const [{ count: totalCount }] = whereCondition
      ? await db
          .select({ count: count() })
          .from(forumPosts)
          .where(whereCondition)
      : await db
          .select({ count: count() })
          .from(forumPosts);
    
    return res.json({
      posts,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});

// Get single forum post by id
router.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, parseInt(id)));
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Check if post is approved or if user is admin
    const isAdmin = req.isAuthenticated() && (req.user as any).role === "admin";
    if (post.moderationStatus !== "approved" && !isAdmin) {
      return res.status(403).json({ error: "This post is not available" });
    }
    
    // Increment view count
    await db
      .update(forumPosts)
      .set({ viewCount: post.viewCount + 1 })
      .where(eq(forumPosts.id, parseInt(id)));
    
    return res.json(post);
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return res.status(500).json({ error: "Failed to fetch forum post" });
  }
});

// Create new forum post with AI moderation
router.post("/posts", async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const validatedData = insertForumPostSchema.parse(req.body);
    
    // Add author ID from session
    validatedData.authorId = (req.user as any).id;
    
    // AI moderation of post content
    const moderationResult = await moderateForumPost(validatedData);
    
    // Set moderation status based on AI result
    const postData = {
      ...validatedData,
      isModerated: true,
      moderationStatus: moderationResult.isAllowed ? "approved" : "flagged",
      moderationNotes: moderationResult.moderationNotes
    };
    
    // Insert post into database
    const [newPost] = await db
      .insert(forumPosts)
      .values(postData)
      .returning();
    
    // Update category post count
    await db
      .update(forumCategories)
      .set({ 
        postCount: db.raw(`${forumCategories.postCount.name} + 1`)
      })
      .where(eq(forumCategories.id, validatedData.categoryId));
    
    return res.status(201).json({
      post: newPost,
      moderation: {
        isAllowed: moderationResult.isAllowed,
        notes: moderationResult.moderationNotes
      }
    });
  } catch (error) {
    console.error("Error creating forum post:", error);
    return res.status(400).json({ error: error.message || "Failed to create forum post" });
  }
});

// Update forum post
router.patch("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Get the post
    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, parseInt(id)));
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Check if user is author or admin
    const isAuthor = post.authorId === req.session.user.id;
    const isAdmin = req.session.user.role === "admin";
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "You don't have permission to edit this post" });
    }
    
    const updates = req.body;
    
    // If content or title is changed, re-moderate
    if (updates.content || updates.title) {
      const contentToModerate = {
        title: updates.title || post.title,
        content: updates.content || post.content
      };
      
      const moderationResult = await moderateForumPost(contentToModerate);
      
      updates.isModerated = true;
      updates.moderationStatus = moderationResult.isAllowed ? "approved" : "flagged";
      updates.moderationNotes = moderationResult.moderationNotes;
    }
    
    const [updatedPost] = await db
      .update(forumPosts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, parseInt(id)))
      .returning();
    
    return res.json(updatedPost);
  } catch (error) {
    console.error("Error updating forum post:", error);
    return res.status(400).json({ error: error.message || "Failed to update forum post" });
  }
});

// Delete forum post
router.delete("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Get the post
    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, parseInt(id)));
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    
    // Check if user is author or admin
    const isAuthor = post.authorId === req.session.user.id;
    const isAdmin = req.session.user.role === "admin";
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "You don't have permission to delete this post" });
    }
    
    // Delete the post
    await db
      .delete(forumPosts)
      .where(eq(forumPosts.id, parseInt(id)));
    
    // Update category post count
    await db
      .update(forumCategories)
      .set({ 
        postCount: db.raw(`GREATEST(0, ${forumCategories.postCount.name} - 1)`) 
      })
      .where(eq(forumCategories.id, post.categoryId));
    
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return res.status(500).json({ error: "Failed to delete forum post" });
  }
});

// Get comments for a post
router.get("/posts/:postId/comments", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const offset = (pageNumber - 1) * limitNumber;
    
    const comments = await db
      .select()
      .from(forumComments)
      .where(and(
        eq(forumComments.postId, parseInt(postId)),
        eq(forumComments.moderationStatus, "approved")
      ))
      .orderBy(forumComments.createdAt)
      .limit(limitNumber)
      .offset(offset);
    
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(forumComments)
      .where(and(
        eq(forumComments.postId, parseInt(postId)),
        eq(forumComments.moderationStatus, "approved")
      ));
    
    return res.json({
      comments,
      pagination: {
        total: Number(totalCount),
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(Number(totalCount) / limitNumber)
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add comment to post with AI moderation
router.post("/posts/:postId/comments", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const validatedData = insertForumCommentSchema.parse(req.body);
    
    // Add author ID and post ID
    validatedData.authorId = req.session.user.id;
    validatedData.postId = parseInt(postId);
    
    // AI moderation of comment content
    const moderationResult = await moderateForumComment(validatedData);
    
    // Set moderation status based on AI result
    const commentData = {
      ...validatedData,
      isModerated: true,
      moderationStatus: moderationResult.isAllowed ? "approved" : "flagged",
      moderationNotes: moderationResult.moderationNotes
    };
    
    // Insert comment into database
    const [newComment] = await db
      .insert(forumComments)
      .values(commentData)
      .returning();
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({ 
        commentCount: db.raw(`${forumPosts.commentCount.name} + 1`) 
      })
      .where(eq(forumPosts.id, parseInt(postId)));
    
    return res.status(201).json({
      comment: newComment,
      moderation: {
        isAllowed: moderationResult.isAllowed,
        notes: moderationResult.moderationNotes
      }
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(400).json({ error: error.message || "Failed to create comment" });
  }
});

// Update comment
router.patch("/comments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Get the comment
    const [comment] = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, parseInt(id)));
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user is author or admin
    const isAuthor = comment.authorId === req.session.user.id;
    const isAdmin = req.session.user.role === "admin";
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "You don't have permission to edit this comment" });
    }
    
    const updates = req.body;
    
    // If content is changed, re-moderate
    if (updates.content) {
      const moderationResult = await moderateForumComment({
        content: updates.content
      });
      
      updates.isModerated = true;
      updates.moderationStatus = moderationResult.isAllowed ? "approved" : "flagged";
      updates.moderationNotes = moderationResult.moderationNotes;
    }
    
    const [updatedComment] = await db
      .update(forumComments)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(forumComments.id, parseInt(id)))
      .returning();
    
    return res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(400).json({ error: error.message || "Failed to update comment" });
  }
});

// Archive or delete comment
router.delete("/comments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const forceDelete = req.query.force === 'true';
    
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Get the comment
    const [comment] = await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.id, parseInt(id)));
    
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user is author or admin
    const isAuthor = comment.authorId === req.session.user.id;
    const isAdmin = req.session.user.role === "admin";
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "You don't have permission to modify this comment" });
    }
    
    // Only admins can force delete comments
    if (forceDelete && !isAdmin) {
      return res.status(403).json({ error: "Only administrators can permanently delete comments" });
    }
    
    // If not forcing delete, analyze for medical relevance
    if (!forceDelete) {
      console.log('Analyzing comment for medical relevance before deletion...');
      const medicalAnalysis = await analyzeMedicalRelevance(comment.content);
      
      // If medically relevant, archive instead of delete
      if (medicalAnalysis.shouldArchive) {
        // Archive the comment
        await db
          .update(forumComments)
          .set({ 
            isArchived: true,
            archivedDate: new Date(),
            medicalRelevance: medicalAnalysis.medicalRelevance,
            aiModerationNotes: medicalAnalysis.reasoning
          })
          .where(eq(forumComments.id, parseInt(id)));
        
        return res.status(200).json({ 
          message: "Comment has been archived due to medical relevance",
          archived: true,
          medicalRelevance: medicalAnalysis.medicalRelevance,
          reasoning: medicalAnalysis.reasoning
        });
      }
    }
    
    // Delete the comment if not archived
    await db
      .delete(forumComments)
      .where(eq(forumComments.id, parseInt(id)));
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({ 
        commentCount: db.raw(`GREATEST(0, ${forumPosts.commentCount.name} - 1)`) 
      })
      .where(eq(forumPosts.id, comment.postId));
    
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error processing comment deletion/archival:", error);
    return res.status(500).json({ error: "Failed to process comment" });
  }
});

// Moderation routes for admins
router.get("/moderation/queue", isAdmin, async (req: Request, res: Response) => {
  try {
    const { type = "posts" } = req.query;
    
    if (type === "posts") {
      const flaggedPosts = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.moderationStatus, "flagged"))
        .orderBy(forumPosts.createdAt);
      
      return res.json(flaggedPosts);
    } else if (type === "comments") {
      const flaggedComments = await db
        .select()
        .from(forumComments)
        .where(eq(forumComments.moderationStatus, "flagged"))
        .orderBy(forumComments.createdAt);
      
      return res.json(flaggedComments);
    } else {
      return res.status(400).json({ error: "Invalid moderation queue type" });
    }
  } catch (error) {
    console.error("Error fetching moderation queue:", error);
    return res.status(500).json({ error: "Failed to fetch moderation queue" });
  }
});

// Update moderation status (admin only)
router.patch("/moderation/:type/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { moderationStatus, moderationNotes } = req.body;
    
    if (type === "posts") {
      const [updatedPost] = await db
        .update(forumPosts)
        .set({ moderationStatus, moderationNotes })
        .where(eq(forumPosts.id, parseInt(id)))
        .returning();
      
      return res.json(updatedPost);
    } else if (type === "comments") {
      const [updatedComment] = await db
        .update(forumComments)
        .set({ moderationStatus, moderationNotes })
        .where(eq(forumComments.id, parseInt(id)))
        .returning();
      
      return res.json(updatedComment);
    } else {
      return res.status(400).json({ error: "Invalid moderation type" });
    }
  } catch (error) {
    console.error("Error updating moderation status:", error);
    return res.status(500).json({ error: "Failed to update moderation status" });
  }
});

// Get archived comments (admin-only endpoint)
router.get("/archives/comments", isAdmin, async (req: Request, res: Response) => {
  try {
    const { 
      postId, 
      medicalRelevanceMin = '0',
      medicalRelevanceMax = '10',
      startDate, 
      endDate,
      search = '',
      page = '1', 
      limit = '20' 
    } = req.query as Record<string, string>;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const minRelevance = parseInt(medicalRelevanceMin) || 0;
    const maxRelevance = parseInt(medicalRelevanceMax) || 10;
    
    // Build query conditions
    let conditions = and(
      eq(forumComments.isArchived, true),
      forumComments.medicalRelevance >= minRelevance,
      forumComments.medicalRelevance <= maxRelevance
    );
    
    // Add optional filters
    if (postId) {
      conditions = and(conditions, eq(forumComments.postId, parseInt(postId)));
    }
    
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      conditions = and(conditions, forumComments.archivedDate >= parsedStartDate);
    }
    
    if (endDate) {
      const parsedEndDate = new Date(endDate);
      conditions = and(conditions, forumComments.archivedDate <= parsedEndDate);
    }
    
    if (search && search.trim() !== '') {
      conditions = and(conditions, like(forumComments.content, `%${search}%`));
    }
    
    // Get archived comments with pagination
    const archivedComments = await db
      .select()
      .from(forumComments)
      .where(conditions)
      .orderBy(desc(forumComments.archivedDate))
      .limit(limitNum)
      .offset(offset);
    
    // Get total count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(forumComments)
      .where(conditions);
    
    // Fetch associated post titles for context
    const postIds = [...new Set(archivedComments.map(comment => comment.postId))];
    const posts = await db
      .select({ id: forumPosts.id, title: forumPosts.title })
      .from(forumPosts)
      .where(forumPosts.id.in(postIds));
    
    // Create a map of post IDs to titles
    const postTitleMap = posts.reduce((map, post) => {
      map[post.id] = post.title;
      return map;
    }, {});
    
    // Enhance comments with post titles
    const enhancedComments = archivedComments.map(comment => ({
      ...comment,
      postTitle: postTitleMap[comment.postId] || 'Unknown Post'
    }));
    
    return res.json({
      archivedComments: enhancedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limitNum)
      }
    });
    
  } catch (error) {
    console.error("Error fetching archived comments:", error);
    return res.status(500).json({ error: "Failed to fetch archived comments" });
  }
});

// Restore an archived comment
router.patch("/archives/comments/:id/restore", isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the comment exists and is archived
    const [comment] = await db
      .select()
      .from(forumComments)
      .where(and(
        eq(forumComments.id, parseInt(id)),
        eq(forumComments.isArchived, true)
      ));
    
    if (!comment) {
      return res.status(404).json({ error: "Archived comment not found" });
    }
    
    // Restore the comment by setting isArchived to false
    const [restoredComment] = await db
      .update(forumComments)
      .set({ 
        isArchived: false,
        archivedDate: null
      })
      .where(eq(forumComments.id, parseInt(id)))
      .returning();
    
    return res.json({
      message: "Comment successfully restored",
      restoredComment
    });
    
  } catch (error) {
    console.error("Error restoring archived comment:", error);
    return res.status(500).json({ error: "Failed to restore archived comment" });
  }
});

// Permanently delete an archived comment (admin only)
router.delete("/archives/comments/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the comment exists and is archived
    const [comment] = await db
      .select()
      .from(forumComments)
      .where(and(
        eq(forumComments.id, parseInt(id)),
        eq(forumComments.isArchived, true)
      ));
    
    if (!comment) {
      return res.status(404).json({ error: "Archived comment not found" });
    }
    
    // Permanently delete the comment
    await db
      .delete(forumComments)
      .where(eq(forumComments.id, parseInt(id)));
    
    // Update post comment count
    await db
      .update(forumPosts)
      .set({ 
        commentCount: db.raw(`GREATEST(0, ${forumPosts.commentCount.name} - 1)`) 
      })
      .where(eq(forumPosts.id, comment.postId));
    
    return res.json({
      message: "Archived comment permanently deleted"
    });
    
  } catch (error) {
    console.error("Error deleting archived comment:", error);
    return res.status(500).json({ error: "Failed to delete archived comment" });
  }
});

export default router;