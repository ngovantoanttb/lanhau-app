-- ========================================================
-- SUPABASE DATABASE SCHEMA FOR LÁ NHẬU APP
-- ========================================================

-- 1. Tạo bảng danh mục (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm 2 danh mục mặc định
INSERT INTO public.categories (id, slug, name, description) VALUES
(1, 'friends', 'Bạn nhậu / Bạn bè', 'Thử thách vui, cụng ly, trò chuyện xôm tụ cả bàn.'),
(2, 'couple', 'Bạn tình / Người yêu', 'Thử thách lãng mạn, thân mật, chỉ dành cho 2 người từ 18 tuổi.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description;

-- 2. Tạo bảng câu hỏi/thử thách (questions)
-- Lưu từng câu dạng 1 dòng dữ liệu (Row-based), KHÔNG dùng cột JSON
CREATE TABLE IF NOT EXISTS public.questions (
    id BIGSERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    category_slug VARCHAR(50) NOT NULL DEFAULT 'friends',
    prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index giúp tìm kiếm nhanh theo danh mục
CREATE INDEX IF NOT EXISTS idx_questions_category_slug ON public.questions(category_slug);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON public.questions(category_id);

-- 3. Tạo bảng hồ sơ Admin & Phê duyệt đăng ký (admin_profiles)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cấu hình Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để tránh trùng lặp
DROP POLICY IF EXISTS "Cho phép tất cả đọc danh mục" ON public.categories;
DROP POLICY IF EXISTS "Cho phép tất cả đọc câu hỏi" ON public.questions;
DROP POLICY IF EXISTS "Admin thêm/sửa/xóa danh mục" ON public.categories;
DROP POLICY IF EXISTS "Admin thêm/sửa/xóa câu hỏi" ON public.questions;
DROP POLICY IF EXISTS "Public read admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public insert admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public update admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Public delete admin profiles" ON public.admin_profiles;

-- Policy 1: User KHÔNG CẦN ĐĂNG NHẬP vẫn xem được bộ câu hỏi & danh mục (Public Select)
CREATE POLICY "Cho phép tất cả đọc danh mục" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Cho phép tất cả đọc câu hỏi" 
ON public.questions FOR SELECT 
USING (true);

CREATE POLICY "Public read admin profiles" 
ON public.admin_profiles FOR SELECT 
USING (true);

CREATE POLICY "Public insert admin profiles" 
ON public.admin_profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public update admin profiles" 
ON public.admin_profiles FOR UPDATE 
USING (true);

CREATE POLICY "Public delete admin profiles" 
ON public.admin_profiles FOR DELETE 
USING (true);

-- Policy 2: Chỉ Admin (đã đăng nhập) mới có quyền Thêm, Sửa, Xóa câu hỏi & danh mục
CREATE POLICY "Admin thêm/sửa/xóa danh mục" 
ON public.categories FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin thêm/sửa/xóa câu hỏi" 
ON public.questions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ========================================================
-- SEED DATA: Thêm từng câu vào bảng (Không dùng JSON)
-- ========================================================

-- Danh mục 1: Bạn nhậu / Bạn bè (friends)
INSERT INTO public.questions (category_id, category_slug, prompt) VALUES
(1, 'friends', 'Uống 1 ngụm, không được nhăn mặt'),
(1, 'friends', 'Chỉ định 1 người uống cùng bạn'),
(1, 'friends', 'Kể 1 chuyện xấu hổ nhất từng làm'),
(1, 'friends', 'Cả bàn cụng ly, hô ''1 2 3 dzô'''),
(1, 'friends', 'Người bên trái bạn uống 1 ngụm'),
(1, 'friends', 'Người bên phải bạn uống 1 ngụm'),
(1, 'friends', 'Hát 1 câu bất kỳ, sai nhịp là uống'),
(1, 'friends', 'Bắt chước giọng 1 người trong bàn'),
(1, 'friends', 'Nói tên 3 loại rượu/bia trong 5 giây'),
(1, 'friends', 'Ai cầm điện thoại lên là uống'),
(1, 'friends', 'Kể 1 bí mật nhỏ (không phải bí mật nghiêm trọng)'),
(1, 'friends', 'Thách 1 người làm mặt hài trong 10 giây'),
(1, 'friends', 'Đổi ly với người ngồi đối diện'),
(1, 'friends', 'Không được nói từ ''uống'' trong 3 lượt, phạm là uống'),
(1, 'friends', 'Cả bàn cùng vỗ tay 3 cái rồi uống'),
(1, 'friends', 'Tự thưởng cho mình 1 ngụm vì đã rút lá này'),
(1, 'friends', 'Người có sinh nhật gần nhất uống'),
(1, 'friends', 'Kể tên người yêu cũ / crush (ai muốn thì kể)'),
(1, 'friends', 'Bắt tay làm quen lại với người bên cạnh như lần đầu gặp'),
(1, 'friends', 'Ai cười trước trong 10 giây tới thì uống'),
(1, 'friends', 'Đọc nhanh 1 câu khó nói 3 lần liên tiếp'),
(1, 'friends', 'Chọn 1 người làm ''sếp'' của bạn tới hết ván'),
(1, 'friends', 'Uống bằng tay không thuận'),
(1, 'friends', 'Kể 1 kỷ niệm vui với người trong bàn'),
(1, 'friends', 'Tất cả nam giới trong bàn uống'),
(1, 'friends', 'Tất cả nữ giới trong bàn uống'),
(1, 'friends', 'Người uống ly gần cạn nhất uống thêm 1 ngụm'),
(1, 'friends', 'Đề nghị 1 câu chúc rồi cả bàn cùng uống'),
(1, 'friends', 'Giả giọng địa phương nói 1 câu bất kỳ'),
(1, 'friends', 'Ai nhìn đồng hồ/điện thoại trước thì uống'),
(1, 'friends', 'Kể món ăn bạn ghét nhất, cả bàn đoán vì sao'),
(1, 'friends', 'Người trẻ tuổi nhất bàn uống'),
(1, 'friends', 'Người lớn tuổi nhất bàn được miễn 1 lượt uống'),
(1, 'friends', 'Tự đặt biệt danh cho mình đêm nay'),
(1, 'friends', 'Chơi kéo búa bao với người đối diện, thua thì uống'),
(1, 'friends', 'Nói 1 lời khen cho người bên trái'),
(1, 'friends', 'Nói 1 lời khen cho người bên phải'),
(1, 'friends', 'Cả bàn đứng dậy hô khẩu hiệu vui rồi ngồi xuống uống'),
(1, 'friends', 'Kể tên 3 bộ phim yêu thích trong 5 giây'),
(1, 'friends', 'Người rút lá này chọn 1 luật mới cho bàn nhậu'),
(1, 'friends', 'Không dùng tay khi uống lượt tới (uống bằng ống hút hoặc nhờ người khác)'),
(1, 'friends', 'Đổi chỗ ngồi với 1 người bất kỳ'),
(1, 'friends', 'Kể lý do vì sao bạn đến bữa nhậu hôm nay'),
(1, 'friends', 'Ai vừa nhắn tin điện thoại thì uống'),
(1, 'friends', 'Tự hỏi tự trả lời 1 câu vui rồi uống'),
(1, 'friends', 'Người ít nói nhất bàn được mời phát biểu'),
(1, 'friends', 'Bắt cả bàn cùng hát 1 câu vu vơ'),
(1, 'friends', 'Uống mà không được dùng tay cầm ly (khum miệng)'),
(1, 'friends', 'Kể 1 điều bạn tự hào về bản thân'),
(1, 'friends', 'Người rút lá áp chót — cả bàn cụng ly chúc mừng'),
(1, 'friends', 'Lá cuối cùng! Cả bàn cùng cạn ly ăn mừng round này');

-- Danh mục 2: Bạn tình / Người yêu (couple)
INSERT INTO public.questions (category_id, category_slug, prompt) VALUES
(2, 'couple', 'Nhìn sâu vào mắt nhau 20 giây, không được cười'),
(2, 'couple', 'Nói 1 điều bạn thích nhất ở đối phương lúc này'),
(2, 'couple', 'Ôm chặt nhau trong 30 giây, không nói gì cả'),
(2, 'couple', 'Hôn nhẹ lên trán đối phương'),
(2, 'couple', 'Thì thầm vào tai một lời ngọt ngào'),
(2, 'couple', 'Nắm tay nhau và kể lại khoảnh khắc thích nhau đầu tiên'),
(2, 'couple', 'Massage vai cho đối phương trong 1 phút'),
(2, 'couple', 'Kể 1 điều bạn muốn cả hai cùng thử trong tương lai gần'),
(2, 'couple', 'Hôn lên má đối phương 3 cái'),
(2, 'couple', 'Nói 1 câu tán tỉnh như lần đầu gặp nhau'),
(2, 'couple', 'Nhảy chậm cùng nhau theo 1 bài hát bất kỳ trong 30 giây'),
(2, 'couple', 'Đọc thuộc lòng 1 câu bạn từng nói khiến đối phương rung động'),
(2, 'couple', 'Cho đối phương chọn 1 bộ phận cơ thể để hôn (má, tay, trán...)'),
(2, 'couple', 'Kể 1 kỷ niệm lãng mạn nhất giữa hai người'),
(2, 'couple', 'Viết ra giấy 1 lời yêu thương và đưa cho đối phương đọc'),
(2, 'couple', 'Nhìn vào mắt nhau và nói ''anh/em yêu em/anh'' bằng giọng khác lạ'),
(2, 'couple', 'Cho đối phương xoa tay mình trong 1 phút'),
(2, 'couple', 'Kể 1 điều khiến bạn rung động khi mới quen đối phương'),
(2, 'couple', 'Cả hai cùng chụp 1 tấm ảnh thân mật'),
(2, 'couple', 'Bịt mắt và đoán cảm giác khi đối phương chạm vào tay bạn'),
(2, 'couple', 'Ngồi sát vào nhau, ôm eo trong 1 phút'),
(2, 'couple', 'Tặng đối phương 1 nụ hôn ở nơi bạn thích nhất'),
(2, 'couple', 'Kể 1 điều bạn biết ơn khi có đối phương bên cạnh'),
(2, 'couple', 'Cho đối phương chải tóc / vuốt tóc bạn trong 30 giây'),
(2, 'couple', 'Nói ra 1 lời hứa nhỏ cho tuần tới'),
(2, 'couple', 'Cùng nhau uống chung 1 ly, tay trong tay'),
(2, 'couple', 'Hôn môi thật nhẹ, đếm đến 3 rồi dừng'),
(2, 'couple', 'Kể 1 điều bạn muốn được đối phương làm nhiều hơn'),
(2, 'couple', 'Ngả đầu vào vai đối phương trong 1 phút, không nói gì'),
(2, 'couple', 'Nói to 3 điểm bạn thấy hấp dẫn ở đối phương lúc này');
