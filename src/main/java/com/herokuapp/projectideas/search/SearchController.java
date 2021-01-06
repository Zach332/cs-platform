package com.herokuapp.projectideas.search;

import com.herokuapp.projectideas.database.Database;
import com.herokuapp.projectideas.database.document.post.Idea;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.NoArgsConstructor;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.SearcherManager;
import org.apache.lucene.search.TopDocs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@NoArgsConstructor
public class SearchController {

    @Autowired
    private SearcherManager searcherManager;

    @Autowired
    private Analyzer analyzer;

    @Autowired
    private Database database;

    private List<Document> searchIndex(String queryString) {
        try {
            searcherManager.maybeRefresh();
            IndexSearcher indexSearcher = searcherManager.acquire();

            Query query = new QueryParser("title", analyzer).parse(queryString);

            TopDocs topDocs = indexSearcher.search(query, 30);
            List<Document> documents = new ArrayList<>();
            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                documents.add(indexSearcher.doc(scoreDoc.doc));
            }

            searcherManager.release(indexSearcher);
            return documents;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Idea> searchForIdea(String queryString) {
        List<Document> documents = searchIndex(queryString);
        List<String> ids = documents
            .stream()
            .map(doc -> doc.get("id"))
            .collect(Collectors.toList());
        List<Idea> unorderedIdeas = database.getIdeasInList(ids);

        List<Idea> orderedIdeas = new ArrayList<Idea>();
        for (String id : ids) {
            orderedIdeas.add(
                unorderedIdeas
                    .stream()
                    .filter(idea -> idea.getId().equals(id))
                    .findFirst()
                    .get()
            );
        }
        return orderedIdeas;
    }
}
