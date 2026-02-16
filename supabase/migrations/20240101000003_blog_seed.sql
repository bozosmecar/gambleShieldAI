-- Seed blog articles (run after 20240101000002_blog_articles.sql)
-- Only inserts if table is empty
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM public.blog_articles) = 0 THEN
    INSERT INTO public.blog_articles (title, excerpt, category, author, date, read_time, image, featured, content) VALUES
    (
      'Understanding Responsible Gaming: A Complete Guide',
      'Learn about the importance of responsible gaming practices and how to maintain a healthy relationship with online gaming.',
      'Education',
      'Sarah Johnson',
      'February 10, 2026',
      '5 min read',
      '/blog/placeholder1.jpg',
      true,
      '<h2>What is Responsible Gaming?</h2>
<p>Responsible gaming is about maintaining a healthy balance between entertainment and well-being. It involves understanding the risks, setting limits, and recognizing when gaming behavior might be becoming problematic.</p>
<h2>Key Principles of Responsible Gaming</h2>
<p>The foundation of responsible gaming rests on several important principles:</p>
<ul>
<li><strong>Set Time Limits:</strong> Establish clear boundaries for how long you spend gaming each day or week.</li>
<li><strong>Budget Management:</strong> Never spend more than you can afford to lose, and treat gaming as entertainment, not income.</li>
<li><strong>Stay Informed:</strong> Understand the odds, rules, and risks associated with different types of gaming.</li>
<li><strong>Take Regular Breaks:</strong> Step away from gaming regularly to maintain perspective and balance.</li>
</ul>
<h2>Recognizing Warning Signs</h2>
<p>It''s crucial to recognize when gaming might be becoming a problem. Watch for these warning signs:</p>
<ul>
<li>Spending more time or money than intended on gaming</li>
<li>Chasing losses or trying to win back money</li>
<li>Gaming to escape problems or relieve anxiety</li>
<li>Lying to family or friends about gaming activities</li>
<li>Neglecting work, relationships, or other responsibilities</li>
</ul>
<h2>Tools and Resources</h2>
<p>GambleShield offers various tools to help you maintain responsible gaming habits:</p>
<ul>
<li>Session timers and reminders</li>
<li>Deposit and loss limits</li>
<li>Self-exclusion options</li>
<li>Reality check notifications</li>
<li>Access to professional support services</li>
</ul>
<h2>Taking Action</h2>
<p>If you''re concerned about your gaming habits or those of someone you know, don''t wait to seek help. Resources are available, and taking the first step toward healthier gaming habits is always worthwhile.</p>
<p>Remember, gaming should be enjoyable and entertaining. When it stops being fun or starts causing problems in other areas of your life, it''s time to reassess and make changes.</p>'
    ),
    (
      'Top 10 Tips for Safe Online Gaming',
      'Discover essential safety tips to protect yourself while enjoying online gaming platforms.',
      'Safety',
      'Michael Chen',
      'February 8, 2026',
      '7 min read',
      '/blog/placeholder2.jpg',
      false,
      '<h2>Protecting Yourself While Gaming Online</h2>
<p>Online gaming can be exciting and entertaining, but it''s essential to prioritize your safety and security. Here are our top 10 tips for safe online gaming.</p>
<h2>1. Choose Licensed Platforms</h2>
<p>Always use platforms that are properly licensed and regulated. Check for valid gaming licenses and regulatory compliance before signing up.</p>
<h2>2. Use Strong Passwords</h2>
<p>Create unique, complex passwords for each gaming account. Use a combination of uppercase and lowercase letters, numbers, and special characters.</p>
<h2>3. Enable Two-Factor Authentication</h2>
<p>Add an extra layer of security to your accounts by enabling two-factor authentication (2FA) wherever available.</p>
<h2>4. Set Deposit Limits</h2>
<p>Most reputable platforms allow you to set daily, weekly, or monthly deposit limits. Use these tools to control your spending.</p>
<h2>5. Never Chase Losses</h2>
<p>Accept that losses are part of gaming. Never try to win back money by increasing your bets or playing longer than planned.</p>
<p>By following these tips, you can enjoy online gaming while minimizing risks and maintaining a healthy, safe gaming experience.</p>'
    ),
    (
      'How to Set Gaming Limits and Stick to Them',
      'Practical strategies for setting and maintaining healthy gaming limits to ensure a balanced lifestyle.',
      'Tips',
      'Emma Williams',
      'February 5, 2026',
      '6 min read',
      '/blog/placeholder3.jpg',
      false,
      '<h2>The Importance of Setting Limits</h2>
<p>Setting and maintaining gaming limits is one of the most effective ways to ensure that gaming remains a fun and controlled activity.</p>
<h2>Types of Limits to Consider</h2>
<p>There are several types of limits you should consider setting:</p>
<ul>
<li><strong>Time Limits:</strong> How long you''ll spend gaming in a single session or over a period</li>
<li><strong>Budget Limits:</strong> How much money you''re willing to spend</li>
<li><strong>Loss Limits:</strong> Maximum losses you''re comfortable with</li>
</ul>
<h2>Practical Strategies</h2>
<p>Be realistic, use platform tools, set reminders, track your activity, and tell someone you trust about your limits.</p>
<p>Remember, limits are there to protect you and ensure gaming remains enjoyable.</p>'
    ),
    (
      'The Psychology Behind Gaming Addiction',
      'An in-depth look at the psychological factors that contribute to gaming addiction and how to recognize warning signs.',
      'Education',
      'Dr. Robert Martinez',
      'February 3, 2026',
      '10 min read',
      '/blog/placeholder4.jpg',
      false,
      '<h2>Understanding Gaming Addiction</h2>
<p>Gaming addiction is a complex condition influenced by psychological, biological, and social factors.</p>
<h2>The Brain''s Reward System</h2>
<p>Gaming activates the brain''s reward pathways, releasing dopamine—the same neurotransmitter involved in other addictive behaviors.</p>
<h2>Psychological Factors</h2>
<p>Escapism, cognitive distortions, impulsivity, and risk-taking personality can all contribute.</p>
<h2>Recognizing Problem Gaming</h2>
<p>Key indicators include preoccupation with gaming, increasing time or money spent, failed attempts to cut back, and lying about gaming activities.</p>
<p>Recovery is possible with the right support and treatment, including CBT, support groups, and healthy coping strategies.</p>'
    ),
    (
      'GambleShield Technology: How It Works',
      'A deep dive into the technology behind GambleShield and how it helps protect users from harmful gaming habits.',
      'Technology',
      'Alex Thompson',
      'January 30, 2026',
      '8 min read',
      '/blog/placeholder5.jpg',
      false,
      '<h2>Introducing GambleShield Technology</h2>
<p>GambleShield uses cutting-edge technology to help users maintain responsible gaming habits.</p>
<h2>Real-Time Behavior Monitoring</h2>
<p>Our system continuously monitors gaming patterns: frequency, duration, spending patterns, and context.</p>
<h2>AI-Powered Risk Assessment</h2>
<p>GambleShield employs artificial intelligence to analyze behavior and provide personalized insights.</p>
<h2>Smart Limit Management</h2>
<p>Deposit limits, loss limits, time limits, and cooling-off periods are all available.</p>
<h2>Data Privacy and Security</h2>
<p>All data is encrypted, stored securely, and never shared without consent.</p>
<p>GambleShield represents the future of responsible gaming technology.</p>'
    ),
    (
      'Supporting a Loved One with Gaming Issues',
      'Guidance for family and friends on how to support someone who may be struggling with gaming-related problems.',
      'Support',
      'Lisa Anderson',
      'January 28, 2026',
      '9 min read',
      '/blog/placeholder6.jpg',
      false,
      '<h2>How to Help Someone You Care About</h2>
<p>If someone you love is struggling with gaming-related problems, you may feel helpless or unsure how to help.</p>
<h2>Recognizing the Signs</h2>
<p>Secretive behavior, financial problems, mood swings, neglecting responsibilities, and lying about time or money spent.</p>
<h2>Starting the Conversation</h2>
<p>Choose a calm moment, express concern from a place of love, use "I" statements, and listen more than you talk.</h2>
<h2>Setting Healthy Boundaries</h2>
<p>Don''t enable by lending money, protect your own finances, and seek support for yourself.</p>
<p>Your support can make a real difference, but ultimately, the person must want to change.</p>'
    );
  END IF;
END $$;
