package cl.netheris.nexus;

import android.content.Context;
import android.graphics.*;
import android.view.*;
import java.util.*;

public class GameView extends View {
 private final Paint p=new Paint(3), text=new Paint(3);
 private float px,py,dx,dy,joyX,joyY,scale=1;
 private boolean moving=false,won=false,ready=false;
 private int shards=0; private final boolean[] got={false,false,false};
 private final RectF karen=new RectF(),karencita=new RectF(),portal=new RectF();
 private final RectF[] crystals={new RectF(),new RectF(),new RectF()};
 private String msg="Katherine: Encuentra los 3 fragmentos y abre el portal Nexus.";
 private long msgUntil=Long.MAX_VALUE;

 public GameView(Context c){super(c);text.setTypeface(Typeface.create("sans",Typeface.BOLD));setKeepScreenOn(true);}
 private void init(float w,float h){scale=Math.min(w/1280f,h/720f);joyX=120*scale;joyY=h-120*scale;px=260*scale;py=h-180*scale;
  set(karen,650,245,710,325);set(karencita,1030,500,1090,580);set(portal,1120,125,1245,260);
  set(crystals[0],470,150,500,190);set(crystals[1],830,390,860,430);set(crystals[2],960,170,990,210);ready=true;}
 private void set(RectF r,float a,float b,float c,float d){r.set(a*scale,b*scale,c*scale,d*scale);}
 private void col(int c){p.setColor(c);p.setStyle(Paint.Style.FILL);}
 @Override protected void onDraw(Canvas c){super.onDraw(c);float w=getWidth(),h=getHeight();if(!ready)init(w,h);
  c.drawColor(Color.rgb(5,14,34)); col(Color.rgb(12,35,62));
  for(int i=0;i<9;i++)c.drawRect(i*w/9,0,i*w/9+2*scale,h,p);for(int i=0;i<6;i++)c.drawRect(0,i*h/6,w,i*h/6+2*scale,p);
  col(Color.rgb(20,70,88));c.drawRoundRect(60*scale,70*scale,w-60*scale,h-70*scale,30*scale,30*scale,p);
  col(Color.rgb(8,25,48));c.drawRoundRect(80*scale,90*scale,w-80*scale,h-90*scale,25*scale,25*scale,p);
  p.setStrokeWidth(7*scale);col(Color.rgb(50,160,190));c.drawLine(150*scale,h/2,w-150*scale,h/2,p);c.drawLine(w/2,100*scale,w/2,h-100*scale,p);
  col(shards==3?Color.rgb(150,90,255):Color.rgb(55,55,90));c.drawRoundRect(portal,18*scale,18*scale,p);label(c,"NEXUS",portal.left+12*scale,portal.centerY()+6*scale,20,Color.WHITE);
  for(int i=0;i<3;i++)if(!got[i]){col(Color.rgb(80,235,255));Path q=new Path();q.moveTo(crystals[i].centerX(),crystals[i].top);q.lineTo(crystals[i].right,crystals[i].centerY());q.lineTo(crystals[i].centerX(),crystals[i].bottom);q.lineTo(crystals[i].left,crystals[i].centerY());q.close();c.drawPath(q,p);}
  girl(c,karen.centerX(),karen.centerY(),Color.rgb(220,75,55),false,"Karen",1);girl(c,karencita.centerX(),karencita.centerY(),Color.rgb(220,75,55),false,"Karencita",.9f);girl(c,px,py,Color.rgb(245,210,95),true,"Katherine",1);
  col(Color.argb(220,4,12,28));c.drawRoundRect(15*scale,12*scale,455*scale,70*scale,18*scale,18*scale,p);label(c,"NETHERIS : NEXUS   Fragmentos "+shards+"/3",30*scale,49*scale,21,Color.WHITE);
  if(System.currentTimeMillis()<msgUntil||msgUntil==Long.MAX_VALUE){col(Color.argb(235,3,10,24));c.drawRoundRect(220*scale,h-110*scale,w-25*scale,h-20*scale,18*scale,18*scale,p);label(c,msg,240*scale,h-60*scale,17,Color.WHITE);}
  col(Color.argb(110,130,220,255));c.drawCircle(joyX,joyY,75*scale,p);col(Color.argb(210,180,245,255));c.drawCircle(joyX+dx*45*scale,joyY+dy*45*scale,30*scale,p);
  label(c,"MOVER",joyX-37*scale,joyY-88*scale,14,Color.WHITE);
  if(won){col(Color.argb(238,3,8,25));c.drawRect(0,0,w,h,p);label(c,"NEXUS RESTAURADO",w/2-185*scale,h/2-25*scale,34,Color.WHITE);label(c,"¡Primera ruta de Netheris recuperada!",w/2-205*scale,h/2+20*scale,19,Color.WHITE);label(c,"Toca para reiniciar",w/2-105*scale,h/2+65*scale,18,Color.rgb(100,230,255));}
  update();invalidate();}
 private void girl(Canvas c,float x,float y,int hair,boolean glasses,String name,float sz){float s=scale*sz;col(Color.rgb(238,194,165));c.drawCircle(x,y-20*s,20*s,p);col(hair);c.drawArc(x-24*s,y-48*s,x+24*s,y-4*s,180,180,true,p);c.drawRect(x-23*s,y-30*s,x-14*s,y+2*s,p);if(name.equals("Karencita"))c.drawRect(x+14*s,y-28*s,x+23*s,y+22*s,p);
  col(name.equals("Karencita")?Color.rgb(180,80,150):name.equals("Karen")?Color.rgb(120,55,70):Color.rgb(55,110,180));c.drawRoundRect(x-19*s,y,x+19*s,y+42*s,8*s,8*s,p);
  if(glasses){p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(3*s);p.setColor(Color.BLACK);c.drawCircle(x-8*s,y-20*s,7*s,p);c.drawCircle(x+8*s,y-20*s,7*s,p);c.drawLine(x-1*s,y-20*s,x+1*s,y-20*s,p);p.setStyle(Paint.Style.FILL);}label(c,name,x-38*s,y+68*s,14,Color.WHITE);}
 private void label(Canvas c,String s,float x,float y,float z,int color){text.setTextSize(z*scale);text.setColor(color);c.drawText(s,x,y,text);}
 private boolean near(RectF r,float range){return Math.abs(px-r.centerX())<range*scale&&Math.abs(py-r.centerY())<range*scale;}
 private void update(){if(won||!moving)return;px+=dx*7*scale;py+=dy*7*scale;px=Math.max(95*scale,Math.min(getWidth()-95*scale,px));py=Math.max(95*scale,Math.min(getHeight()-95*scale,py));
  for(int i=0;i<3;i++)if(!got[i]&&near(crystals[i],55)){got[i]=true;shards++;say("Fragmento "+shards+"/3 recuperado.");}
  if(near(karen,65))say("Karen: Hay una anomalía cerca del portal. Ve con cuidado.");
  if(near(karencita,65))say("Karencita: ¡Vamos! Los cristales celestes son fragmentos.");
  if(near(portal,85)){if(shards==3)won=true;else say("Portal bloqueado: faltan "+(3-shards)+" fragmentos.");}}
 private void say(String s){if(!msg.equals(s)||System.currentTimeMillis()>msgUntil){msg=s;msgUntil=System.currentTimeMillis()+1800;}}
 @Override public boolean onTouchEvent(MotionEvent e){if(!ready)return true;if(won&&e.getAction()==MotionEvent.ACTION_DOWN){px=260*scale;py=getHeight()-180*scale;shards=0;Arrays.fill(got,false);won=false;msg="Katherine: Nueva sincronización iniciada.";msgUntil=System.currentTimeMillis()+1800;return true;}
  int a=e.getActionMasked();if(a==MotionEvent.ACTION_DOWN||a==MotionEvent.ACTION_MOVE){float vx=e.getX()-joyX,vy=e.getY()-joyY,d=(float)Math.sqrt(vx*vx+vy*vy);if(d<160*scale||moving){moving=true;if(d>8*scale){dx=vx/d;dy=vy/d;}else dx=dy=0;return true;}}
  if(a==MotionEvent.ACTION_UP||a==MotionEvent.ACTION_CANCEL){moving=false;dx=dy=0;}return true;}
}