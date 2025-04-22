
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function AccessCheck({ children }: { children: React.ReactNode }) {
  const [hasAccess, setHasAccess] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('check_user_access', { user_uid: user.id });

      if (error) {
        console.error('Error checking access:', error);
        return;
      }

      setHasAccess(data);
      setShowDialog(!data);
    };

    checkAccess();
    const interval = setInterval(checkAccess, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async () => {
    try {
      const { data: { data, error } } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  if (!hasAccess) {
    return (
      <>
        <div className="relative filter blur-sm pointer-events-none">
          {children}
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Access Required</DialogTitle>
              <DialogDescription>
                Your trial has expired. Upgrade to premium to continue accessing all features.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to Premium (€5)
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}
