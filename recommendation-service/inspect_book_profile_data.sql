-- Read-only inspection of the existing Book_Profile feature rows.
-- Run this in Supabase SQL Editor before deciding whether to use these values
-- as canonical feature weights. It does not modify any data.
SELECT
    bp."BooksID",
    b."Books_title",
    bp."CategoriseID",
    c."Categorise_Name",
    bp."SubcategoriseID",
    sc."Subcategorise_Name",
    bp."Feature_Value"
FROM public."Book_Profile" AS bp
LEFT JOIN public."Books" AS b
    ON b."BooksID" = bp."BooksID"
LEFT JOIN public."Categorise" AS c
    ON c."CategoriseID" = bp."CategoriseID"
LEFT JOIN public."Subcategorise" AS sc
    ON sc."SubcategoriseID" = bp."SubcategoriseID"
ORDER BY bp."BooksID", bp."CategoriseID", bp."SubcategoriseID"
LIMIT 100;

-- Summary to check whether the Feature_Value entries have plausible values.
SELECT
    COUNT(*) AS total_profile_rows,
    COUNT("Feature_Value") AS rows_with_feature_value,
    MIN("Feature_Value") AS min_feature_value,
    MAX("Feature_Value") AS max_feature_value,
    AVG("Feature_Value") AS avg_feature_value
FROM public."Book_Profile";
