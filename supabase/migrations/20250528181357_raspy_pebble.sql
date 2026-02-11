-- Create stored procedure for cleaning test data
CREATE OR REPLACE PROCEDURE cleanup_test_data()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete test data while preserving schema
    DELETE FROM user_progress;
    DELETE FROM user_roles;
    DELETE FROM role_permissions;
    
    -- Reset sequences
    ALTER SEQUENCE user_progress_id_seq RESTART WITH 1;
    
    -- Reinsert default role permissions
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    CROSS JOIN permissions p
    WHERE r.name = 'company_admin';

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    CROSS JOIN permissions p
    WHERE r.name = 'new_hire'
    AND p.name IN ('view_missions', 'view_tasks', 'add_gallery_items');
    
    COMMIT;
END;
$$;