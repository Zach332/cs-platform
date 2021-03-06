package com.herokuapp.projectideas.database.query;

import com.github.mohitgoyal91.cosmosdbqueryutils.RestrictionBuilder;
import com.github.mohitgoyal91.cosmosdbqueryutils.SelectQuery;
import com.herokuapp.projectideas.database.document.RootDocument;
import com.herokuapp.projectideas.database.document.message.Message;
import com.herokuapp.projectideas.database.document.post.Post;
import com.herokuapp.projectideas.database.document.project.Project;
import com.herokuapp.projectideas.database.document.tag.Tag;
import com.herokuapp.projectideas.database.document.user.User;
import com.herokuapp.projectideas.database.document.user.UserJoinedProject;
import com.herokuapp.projectideas.database.document.user.UserPostedIdea;
import com.herokuapp.projectideas.database.document.user.UserSavedIdea;
import com.herokuapp.projectideas.database.document.vote.IdeaUpvote;
import com.herokuapp.projectideas.database.document.vote.ProjectUpvote;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Set;
import org.reflections.Reflections;

public class GenericQueries {

    private static final Reflections reflections = new Reflections(
        "com.herokuapp.projectideas.database"
    );

    private static final String USER_CONTAINER_PARTITION_KEY = "userId";
    private static final String POST_CONTAINER_PARTITION_KEY = "ideaId";
    private static final String TAG_CONTAINER_PARTITION_KEY = "type";
    private static final String PROJECT_CONTAINER_PARTITION_KEY = "projectId";

    public static <T extends RootDocument> SelectQuery queryByType(
        Class<T> classType
    ) {
        return new SelectQuery()
        .addRestrictions(
                new RestrictionBuilder()
                .in("type", (Object[]) getTypes(classType))
            );
    }

    public static <T extends RootDocument> SelectQuery queryById(
        String id,
        Class<T> classType
    ) {
        return queryByType(classType)
            .addRestrictions(new RestrictionBuilder().eq("id", id));
    }

    public static <T extends RootDocument> SelectQuery queryByPartitionKey(
        String partitionKey,
        Class<T> classType
    ) {
        return queryByType(classType)
            .addRestrictions(
                new RestrictionBuilder()
                .eq(getPartitionKey(classType), partitionKey)
            );
    }

    public static <T extends RootDocument> SelectQuery queryByIdAndPartitionKey(
        String id,
        String partitionKey,
        Class<T> classType
    ) {
        return queryByType(classType)
            .addRestrictions(
                new RestrictionBuilder().eq("id", id),
                new RestrictionBuilder()
                .eq(getPartitionKey(classType), partitionKey)
            );
    }

    public static <T extends RootDocument> SelectQuery queryByPartitionKeyList(
        List<String> partitionKeys,
        Class<T> classType
    ) {
        return queryByType(classType)
            .addRestrictions(
                new RestrictionBuilder()
                .in(getPartitionKey(classType), partitionKeys.toArray())
            );
    }

    private static String getPartitionKey(
        Class<? extends RootDocument> classType
    ) {
        if (
            User.class.isAssignableFrom(classType) ||
            Message.class.isAssignableFrom(classType) ||
            UserPostedIdea.class.isAssignableFrom(classType) ||
            UserSavedIdea.class.isAssignableFrom(classType) ||
            UserJoinedProject.class.isAssignableFrom(classType)
        ) {
            return USER_CONTAINER_PARTITION_KEY;
        } else if (
            Post.class.isAssignableFrom(classType) ||
            IdeaUpvote.class.isAssignableFrom(classType)
        ) {
            return POST_CONTAINER_PARTITION_KEY;
        } else if (Tag.class.isAssignableFrom(classType)) {
            return TAG_CONTAINER_PARTITION_KEY;
        } else if (
            Project.class.isAssignableFrom(classType) ||
            ProjectUpvote.class.isAssignableFrom(classType)
        ) {
            return PROJECT_CONTAINER_PARTITION_KEY;
        }
        throw new IllegalArgumentException(
            "The class " +
            classType.getName() +
            " does not have an associated partition key."
        );
    }

    private static <T> String[] getTypes(Class<T> classType) {
        Set<Class<? extends T>> classes = reflections.getSubTypesOf(classType);
        classes.add(classType);
        return classes
            .stream()
            .filter(
                classTypeArg ->
                    !Modifier.isAbstract(classTypeArg.getModifiers())
            )
            .map(classTypeArg -> classTypeArg.getSimpleName())
            .toArray(String[]::new);
    }
}
